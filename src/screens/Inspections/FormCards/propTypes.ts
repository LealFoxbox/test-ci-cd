import { DraftPhoto } from 'src/types';

import { CommentInputProps } from './CardFooter';

export interface TextCardProps {
  id: number;
  name: string;
  description: string | null;
  commentInputProps: CommentInputProps;
  photos: DraftPhoto[];
  onTapPhoto: (index: number) => void;
  onTakePhoto: (uri: string, isFromGallery: boolean) => void;
  onDelete: () => void;
}

export interface BaseCardProps extends TextCardProps {
  onAddComment: () => void;
  showComment: boolean;
}
