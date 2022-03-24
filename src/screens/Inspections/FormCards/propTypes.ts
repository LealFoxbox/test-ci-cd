import { DraftPhoto } from 'src/types';

import { CommentInputProps } from './CardFooter';
import { onTakePhotoType } from './createRenderCard';

export interface TextCardProps {
  id: number;
  name: string;
  description: string | null;
  commentInputProps: CommentInputProps;
  photos: DraftPhoto[];
  onTapPhoto: (index: number) => void;
  onTakePhoto: onTakePhotoType;
  onDeletePhoto: (photo: DraftPhoto) => void;
  onDelete: () => void;
  allowDelete: boolean;
  isReadonly: boolean;
  error?: boolean;
  errorMessage?: string;
  onTakeCamera: (callback: () => void) => void;
}

export interface BaseCardProps extends TextCardProps {
  onAddComment: () => void;
  showComment: boolean;
}
