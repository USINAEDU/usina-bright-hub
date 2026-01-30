# 🚀 GUIA DE CONFIGURAÇÃO DO BACKEND - USINA DOCS

> **Este documento é destinado ao desenvolvedor backend responsável pela configuração do Supabase.**

---

## 📋 ÍNDICE

1. [Informações do Projeto](#1-informações-do-projeto)
2. [Estrutura do Banco de Dados](#2-estrutura-do-banco-de-dados)
3. [Scripts SQL de Criação](#3-scripts-sql-de-criação)
4. [Políticas RLS (Row Level Security)](#4-políticas-rls)
5. [Storage (Bucket para Arquivos)](#5-storage)
6. [Usuário Inicial](#6-usuário-inicial)
7. [Deploy no cPanel](#7-deploy-no-cpanel)
8. [Checklist Final](#8-checklist-final)

---

## 1. INFORMAÇÕES DO PROJETO

```
SUPABASE URL: https://decndldnjmuesytdpxib.supabase.co
SUPABASE ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O frontend já está configurado com essas credenciais em:
- `src/integrations/supabase/client.ts`

---

## 2. ESTRUTURA DO BANCO DE DADOS

### Diagrama ER

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   auth.users    │     │    profiles     │     │   user_roles    │
│   (Supabase)    │────▶│  id (FK users)  │     │  user_id (FK)   │
└─────────────────┘     │  email          │     │  role (enum)    │
                        │  name           │     └─────────────────┘
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     sectors     │────▶│     folders     │────▶│    documents    │
│  id, name, icon │     │  sector_id (FK) │     │  folder_id (FK) │
│  created_by     │     │  parent_folder  │     │  sector_id (FK) │
└─────────────────┘     │  created_by     │     │  file_path      │
                        └─────────────────┘     │  created_by     │
                                                └─────────────────┘
```

---

## 3. SCRIPTS SQL DE CRIAÇÃO

Execute estes scripts no **SQL Editor** do Supabase na ordem apresentada:

### 3.1 Enums

```sql
-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Enum para tipos de documento
CREATE TYPE public.document_type AS ENUM ('pdf', 'image', 'doc');
```

### 3.2 Tabela: profiles

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para criar profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3.3 Tabela: user_roles

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Função para verificar role (evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### 3.4 Tabela: sectors

```sql
CREATE TABLE public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Folder',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sectors_name ON public.sectors(name);
```

### 3.5 Tabela: folders

```sql
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES public.sectors(id) ON DELETE CASCADE NOT NULL,
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_folders_sector ON public.folders(sector_id);
CREATE INDEX idx_folders_parent ON public.folders(parent_folder_id);
```

### 3.6 Tabela: documents

```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
  sector_id UUID REFERENCES public.sectors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_documents_folder ON public.documents(folder_id);
CREATE INDEX idx_documents_sector ON public.documents(sector_id);
CREATE INDEX idx_documents_name ON public.documents(name);
```

---

## 4. POLÍTICAS RLS

### 4.1 Habilitar RLS em todas as tabelas

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
```

### 4.2 Políticas para profiles

```sql
-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

### 4.3 Políticas para user_roles

```sql
-- Apenas admins podem ver roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Usuários podem ver sua própria role
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### 4.4 Políticas para sectors, folders, documents

```sql
-- SECTORS: Todos autenticados podem ver
CREATE POLICY "Authenticated users can view sectors"
  ON public.sectors FOR SELECT
  TO authenticated
  USING (true);

-- SECTORS: Apenas admins podem criar/editar/deletar
CREATE POLICY "Admins can manage sectors"
  ON public.sectors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FOLDERS: Todos autenticados podem ver
CREATE POLICY "Authenticated users can view folders"
  ON public.folders FOR SELECT
  TO authenticated
  USING (true);

-- FOLDERS: Todos autenticados podem criar/editar/deletar
CREATE POLICY "Authenticated users can manage folders"
  ON public.folders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DOCUMENTS: Todos autenticados podem ver
CREATE POLICY "Authenticated users can view documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

-- DOCUMENTS: Todos autenticados podem criar/editar/deletar
CREATE POLICY "Authenticated users can manage documents"
  ON public.documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

---

## 5. STORAGE

### 5.1 Criar bucket para documentos

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);
```

### 5.2 Políticas de Storage

```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Permitir leitura pública (bucket público)
CREATE POLICY "Public can view documents"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'documents');

-- Permitir deleção para usuários autenticados
CREATE POLICY "Authenticated users can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');
```

---

## 6. USUÁRIO INICIAL

### 6.1 Criar usuário admin

1. Vá em **Authentication > Users** no Supabase
2. Clique em **Add User**
3. Preencha:
   - Email: `admin@usinaedu.com.br` (ou o email desejado)
   - Password: senha segura
4. Após criar, copie o `user_id`

### 6.2 Atribuir role de admin

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<USER_ID_DO_ADMIN>', 'admin');
```

### 6.3 Criar setores iniciais (opcional)

```sql
INSERT INTO public.sectors (name, icon, created_by)
VALUES 
  ('Geral', 'Folder', '<USER_ID_DO_ADMIN>'),
  ('RH', 'Users', '<USER_ID_DO_ADMIN>'),
  ('Financeiro', 'DollarSign', '<USER_ID_DO_ADMIN>'),
  ('Marketing', 'Megaphone', '<USER_ID_DO_ADMIN>'),
  ('TI', 'Monitor', '<USER_ID_DO_ADMIN>');
```

---

## 7. DEPLOY NO CPANEL

### 7.1 Build do projeto

```bash
npm run build
```

Isso gera a pasta `dist/` com os arquivos estáticos.

### 7.2 Upload no cPanel

1. Acesse o **File Manager** do cPanel
2. Navegue até `public_html` (ou subpasta desejada)
3. Faça upload de todo o conteúdo da pasta `dist/`
4. Certifique-se que `index.html` está na raiz

### 7.3 Configurar .htaccess (SPA routing)

Crie um arquivo `.htaccess` na raiz com:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 8. CHECKLIST FINAL

### Banco de Dados
- [ ] Enums criados (app_role, document_type)
- [ ] Tabela profiles criada com triggers
- [ ] Tabela user_roles criada com função has_role
- [ ] Tabela sectors criada
- [ ] Tabela folders criada
- [ ] Tabela documents criada
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS aplicadas

### Storage
- [ ] Bucket 'documents' criado
- [ ] Políticas de storage aplicadas

### Usuários
- [ ] Usuário admin criado
- [ ] Role admin atribuída

### Deploy
- [ ] Build gerado com `npm run build`
- [ ] Arquivos enviados para cPanel
- [ ] .htaccess configurado
- [ ] Teste de login funcionando
- [ ] Teste de criação de pasta funcionando
- [ ] Teste de upload de documento funcionando

---

## 📞 SUPORTE

Em caso de dúvidas sobre a estrutura do frontend ou integração:
- Arquivos de tipos: `src/integrations/supabase/database.types.ts`
- Cliente Supabase: `src/integrations/supabase/client.ts`
- Contexto de dados: `src/contexts/DocumentStoreContext.tsx`
- Contexto de auth: `src/contexts/AuthContext.tsx`

---

**Última atualização:** Janeiro 2026
