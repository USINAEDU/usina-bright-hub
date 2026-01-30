export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Sector {
  id: string;
  name: string;
  icon: string;
  color?: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  sectorId: string;
  parentFolderId?: string;
  name: string;
  createdAt: string;
}

export interface Document {
  id: string;
  folderId: string;
  sectorId: string;
  name: string;
  description?: string;
  type: 'pdf' | 'image' | 'doc';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'sector' | 'folder';
}
