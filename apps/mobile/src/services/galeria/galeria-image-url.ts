import { Asset } from "expo-asset";
import { useEffect, useState } from "react";

import type { CountryFlagImage } from "@geopoto/geo-data/flag-images";

/**
 * Galeria's native full-screen viewer loads its `urls` with platform image
 * loaders (Glide on Android) that cannot resolve React Native's bundled asset
 * references in release builds. Passing the raw `require()` module works in a
 * debug build (Metro serves it over HTTP) but shows a black screen once the app
 * is bundled. Resolving the module to a real `file://` URI via expo-asset gives
 * the native viewer something it can load on every platform and build type.
 */
export function useGaleriaImageUrl(
  imageSource: CountryFlagImage | null,
): string | null {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageSource === null) {
      setImageUrl(null);
      return;
    }

    let isMounted = true;

    setImageUrl(null);

    async function resolveImageUrl(source: CountryFlagImage) {
      const asset = Asset.fromModule(source);

      if (asset.localUri === null) {
        await asset.downloadAsync();
      }

      if (!isMounted) {
        return;
      }

      setImageUrl(asset.localUri ?? asset.uri);
    }

    void resolveImageUrl(imageSource).catch(() => {
      if (!isMounted) {
        return;
      }

      setImageUrl(null);
    });

    return () => {
      isMounted = false;
    };
  }, [imageSource]);

  return imageUrl;
}
