import { Image } from "expo-image";
import {
  memo,
  useCallback,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import {
  PixelRatio,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/AppTheme";
import { getResizedImageUri } from "@/utils/imageSource";

const IMAGE_PLACEHOLDER_HASH = "L24VcwE1M{Rj00ofRjofM{t7ofWB";

type ExpoImageProps = ComponentProps<typeof Image>;

type OptimizedImageProps = Omit<
  ExpoImageProps,
  | "cachePolicy"
  | "contentFit"
  | "onError"
  | "onLoad"
  | "onLoadStart"
  | "placeholder"
  | "placeholderContentFit"
  | "source"
  | "style"
  | "transition"
> & {
  contentFit?: ExpoImageProps["contentFit"];
  recyclingKey?: string;
  sourceUri: string;
  style?: StyleProp<ViewStyle>;
  targetWidth: number;
  transition?: number;
};

function OptimizedImageBase({
  contentFit = "cover",
  priority = "normal",
  recyclingKey,
  sourceUri,
  style,
  targetWidth,
  transition = 180,
  ...imageProps
}: OptimizedImageProps) {
  const { colors, isDark } = useAppTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const resizedUri = useMemo(
    () => getResizedImageUri(sourceUri, targetWidth * PixelRatio.get()),
    [sourceUri, targetWidth],
  );
  const source = useMemo(() => ({ uri: resizedUri }), [resizedUri]);
  const handleLoadStart = useCallback(() => {
    setIsLoaded(false);
  }, []);
  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <View style={style}>
      {!isLoaded ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.placeholder,
            {
              backgroundColor: isDark ? colors.surfaceVariant : colors.elevated,
            },
          ]}
        />
      ) : null}
      <Image
        {...imageProps}
        cachePolicy="disk"
        contentFit={contentFit}
        placeholder={IMAGE_PLACEHOLDER_HASH}
        placeholderContentFit={contentFit}
        priority={priority}
        recyclingKey={recyclingKey}
        source={source}
        style={StyleSheet.absoluteFill}
        transition={transition}
        onError={handleLoadComplete}
        onLoad={handleLoadComplete}
        onLoadStart={handleLoadStart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    opacity: 0.92,
  },
});

export const OptimizedImage = memo(OptimizedImageBase);
