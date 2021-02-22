import React, { useLayoutEffect, useRef, useState } from 'react';
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
    containerStyle?: ViewStyle;
    onReady?: () => void;
  }
> = ({ numberOfLines, children, containerStyle, onReady, ...props }) => {
  const _text = useRef<View | null>(null);
  const _fullHeight = useRef<number | null>(null);
  const [measured, setMeasured] = useState<boolean>(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState<boolean | null>(null);
  const [showAllText, setShowAllText] = useState<boolean>(false);
  const theme = useTheme();

  useLayoutEffect(() => {
    let mounted = true;

    (async () => {
      if (!measured) {
        await nextFrameAsync();
        if (!mounted) {
          return;
        }
        // Get the height of the text with no restriction on number of lines
        _fullHeight.current = await measureHeightAsync(_text.current);
        if (!mounted) {
          return;
        }
        setMeasured(true);
      } else {
        if (shouldShowReadMore === null) {
          await nextFrameAsync();
          if (!mounted) {
            return;
          }
          // Get the height of the text now that number of lines has been set
          const limitedHeight = await measureHeightAsync(_text.current);
          if (!mounted) {
            return;
          }

          // TODO: this was triggered on an unmounted component somehow
          setShouldShowReadMore((_fullHeight.current || 0) > limitedHeight);
        } else {
          await nextFrameAsync();
          if (!mounted) {
            return;
          }
          onReady && onReady();
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [measured, onReady, shouldShowReadMore]);

  return (
    <View
      style={[
        containerStyle || {},
        {
          opacity: measured && shouldShowReadMore !== null ? 1 : 0,
        },
      ]}
    >
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
