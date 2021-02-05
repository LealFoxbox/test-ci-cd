import { ComponentType } from 'react';
import { GestureResponderEvent, ImageURISource } from 'react-native';

export type ControlType = {
  onPress: () => void;
};

export type ControlsType = {
  close?: ComponentType<ControlType> | null;
  next?: ComponentType<ControlType> | null;
  prev?: ComponentType<ControlType> | null;
};

export type TouchType = {
  pageX: number;
  pageY: number;
};

export type NativeEventType = {
  touches: Array<TouchType>;
  contentOffset: { x: number; y: number };
};

export type EventType = { nativeEvent: GestureResponderEvent };

export type ImageType = {
  loaded?: boolean;
  source: ImageURISource;
  width?: number;
  height?: number;
  title?: string | null;
  index: number;
};

export type TranslateType = {
  x: number;
  y: number;
};

export type GestureState = {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
};

export type DimensionsType = { width: number; height: number };
export type ScreenDimensionsType = { screenWidth: number; screenHeight: number };

export type ImageSizeType = DimensionsType & { index: number };

export type TransitionType = { scale: number; translate: TranslateType };
