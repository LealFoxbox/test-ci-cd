/* eslint-disable react-native/no-color-literals */
/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { ComponentType, useCallback, useEffect } from 'react';
import { Animated, Modal, ModalProps, StyleSheet, View, VirtualizedList } from 'react-native';

import ImageItem from './components/ImageItem/ImageItem';
import ImageDefaultHeader from './components/ImageDefaultHeader';
import StatusBarManager from './components/StatusBarManager';
import useAnimatedComponents from './hooks/useAnimatedComponents';
import useImageIndexChange from './hooks/useImageIndexChange';
import useRequestClose from './hooks/useRequestClose';
import { Dimensions, ImageSource } from './types';

type Props = {
  images: ImageSource[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  onLongPress?: (image: ImageSource) => void;
  onImageIndexChange?: (imageIndex: number) => void;
  presentationStyle?: ModalProps['presentationStyle'];
  animationType?: ModalProps['animationType'];
  backgroundColor?: string;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  delayLongPress?: number;
  HeaderComponent?: ComponentType<{ imageIndex: number }>;
  FooterComponent?: ComponentType<{ imageIndex: number }>;
};

const DEFAULT_ANIMATION_TYPE = 'fade';
const DEFAULT_BG_COLOR = '#000';
const DEFAULT_DELAY_LONG_PRESS = 800;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    top: 0,
  },
  footer: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    bottom: 0,
  },
});

function ExpandedGallery({
  images,
  imageIndex,
  visible,
  onRequestClose,
  onLongPress = () => {
    /* */
  },
  onImageIndexChange,
  animationType = DEFAULT_ANIMATION_TYPE,
  backgroundColor = DEFAULT_BG_COLOR,
  presentationStyle,
  swipeToCloseEnabled,
  doubleTapToZoomEnabled,
  delayLongPress = DEFAULT_DELAY_LONG_PRESS,
  HeaderComponent,
  FooterComponent,
}: Props) {
  const imageIndexGallery = imageIndex >= images?.length ? images.length - 1 : imageIndex;
  const imageListRef = React.createRef<VirtualizedList<ImageSource>>();
  const [opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);
  const [layout, setLayout] = React.useState<Dimensions>({ width: 0, height: 0 });
  const [currentImageIndex, onScroll] = useImageIndexChange(imageIndexGallery, layout);
  const [headerTransform, footerTransform, toggleBarsVisible] = useAnimatedComponents();

  useEffect(() => {
    if (onImageIndexChange) {
      onImageIndexChange(currentImageIndex);
    }
  }, [currentImageIndex, onImageIndexChange]);

  useEffect(() => {
    if (images?.length > currentImageIndex) {
      imageListRef.current?.scrollToIndex({ index: currentImageIndex, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const onZoom = useCallback(
    (isScaled: boolean) => {
      // @ts-ignore
      imageListRef?.current?.setNativeProps({ scrollEnabled: !isScaled });
      toggleBarsVisible(!isScaled);
    },
    [imageListRef, toggleBarsVisible],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={presentationStyle === 'overFullScreen'}
      visible={visible}
      presentationStyle={presentationStyle}
      animationType={animationType}
      onRequestClose={onRequestCloseEnhanced}
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      hardwareAccelerated
    >
      <StatusBarManager presentationStyle={presentationStyle} />
      <View
        onLayout={(e) => {
          setLayout(e.nativeEvent.layout);
        }}
        style={[styles.container, { opacity, backgroundColor }]}
      >
        {/* @ts-ignore*/}
        <Animated.View style={[styles.header, { transform: headerTransform }]}>
          {typeof HeaderComponent !== 'undefined' ? (
            React.createElement(HeaderComponent, {
              imageIndex: currentImageIndex,
            })
          ) : (
            <ImageDefaultHeader onRequestClose={onRequestCloseEnhanced} />
          )}
        </Animated.View>
        <VirtualizedList
          ref={imageListRef}
          data={images}
          horizontal
          pagingEnabled
          windowSize={2}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={imageIndexGallery}
          getItem={(_, index) => images[index]}
          getItemCount={() => images.length}
          getItemLayout={(_, index) => ({
            length: layout.width,
            offset: layout.width * index,
            index,
          })}
          renderItem={({ item: imageSrc }) => (
            <ImageItem
              onZoom={onZoom}
              imageSrc={imageSrc}
              onRequestClose={onRequestCloseEnhanced}
              onLongPress={onLongPress}
              delayLongPress={delayLongPress}
              swipeToCloseEnabled={swipeToCloseEnabled}
              doubleTapToZoomEnabled={doubleTapToZoomEnabled}
              layout={layout}
            />
          )}
          onMomentumScrollEnd={onScroll}
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-return
          keyExtractor={(imageSrc: any) => imageSrc?.uri || `${imageSrc}`}
        />
        {typeof FooterComponent !== 'undefined' && (
          // @ts-ignore
          <Animated.View style={[styles.footer, { transform: footerTransform }]}>
            {React.createElement(FooterComponent, {
              imageIndex: currentImageIndex,
            })}
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const EnhancedExpandedGallery = (props: Props) => <ExpandedGallery key={props.imageIndex} {...props} />;

export default EnhancedExpandedGallery;
