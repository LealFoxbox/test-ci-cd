import { DraftPhoto } from 'src/types';

import { CommentInputProps } from './CardFooter';

export interface TextCardProps {
  id: number;
  name: string;
  description: string | null;
  commentInputProps: CommentInputProps;
  photos: DraftPhoto[];
  onTapPhoto: (index: number) => void;
  onTakePhoto: (params: { uri: string; fileName: string }, isFromGallery: boolean) => void;
  onDeletePhoto: (photo: DraftPhoto) => void;
  onDelete: () => void;
  allowDelete: boolean;
  isReadonly: boolean;
}

export interface BaseCardProps extends TextCardProps {
  onAddComment: () => void;
  showComment: boolean;
}
