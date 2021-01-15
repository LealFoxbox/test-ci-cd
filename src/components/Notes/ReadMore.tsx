import React, { useEffect, useRef, useState } from 'react';
import { Text, TextProps, View, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

function measureHeightAsync(component: View | null | undefined) {
  return new Promise<number>((resolve) => {
    if (!component) {
      resolve(0);
    } else {
      component.measure((_x, _y, _w, h) => {
        resolve(h);
      });
    }
  });
}

function nextFrameAsync() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

const ReadMore: React.FC<
  TextProps & {
    onReady?: () => void;
    containerStyle?: ViewStyle;
  }
> = ({ numberOfLines, children, onReady, containerStyle, ...props }) => {
  const _text = useRef<View | null>(null);
  const _isMounted = useRef<boolean>(false);
  const [measured, setMeasured] = useState<boolean>(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState<boolean>(false);
  const [showAllText, setShowAllText] = useState<boolean>(false);
  const theme = useTheme();

  // TODO: refactor this useEffect, it's copypasted and out of date with best practices
  useEffect(() => {
    (async () => {
      _isMounted.current = true;
      await nextFrameAsync();

      if (!_isMounted.current) {
        return;
      }

      // Get the height of the text with no restriction on number of lines
      const fullHeight = await measureHeightAsync(_text.current);
      setMeasured(true);
      await nextFrameAsync();

      if (!_isMounted.current) {
        return;
      }

      // Get the height of the text now that number of lines has been set
      const limitedHeight = await measureHeightAsync(_text.current);

      if (fullHeight > limitedHeight) {
        setShouldShowReadMore(true);
        onReady && onReady();
      } else {
        onReady && onReady();
      }
    })();

    return () => {
      _isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={containerStyle || {}}>
      <Text
        numberOfLines={measured && !showAllText ? numberOfLines : 0}
        ref={(text) => {
          _text.current = text;
        }}
        {...props}
      >
        {children}
      </Text>

      {shouldShowReadMore &&
        (!showAllText ? (
          <Button
            style={{ alignSelf: 'flex-end', marginTop: 10 }}
            color={theme.colors.primary}
            compact
            onPress={() => {
              setShowAllText(true);
            }}
          >
            Read More
          </Button>
        ) : (
          <Button
            style={{ alignSelf: 'flex-end', marginTop: 10 }}
            color={theme.colors.primary}
            compact
            onPress={() => {
              setShowAllText(false);
            }}
          >
            Hide
          </Button>
        ))}
    </View>
  );
};

export default ReadMore;
