// Type declarations for react-simple-maps
// The library doesn't ship its own types for React 19
declare module "react-simple-maps" {
  import { ComponentType, ReactNode, CSSProperties, SVGProps } from "react";

  interface ProjectionConfig {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
    parallels?: [number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
    className?: string;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (event: { coordinates: [number, number]; zoom: number }) => void;
    onMove?: (event: { coordinates: [number, number]; zoom: number }) => void;
    onMoveEnd?: (event: { coordinates: [number, number]; zoom: number }) => void;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (data: { geographies: GeographyShape[] }) => ReactNode;
    parseGeographies?: (geos: GeographyShape[]) => GeographyShape[];
  }

  interface GeographyShape {
    rsmKey: string;
    type: string;
    properties: Record<string, string>;
    geometry: object;
    id?: string;
  }

  interface GeographyStyleProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    outline?: string;
    filter?: string;
    cursor?: string;
  }

  interface GeographyProps extends Omit<SVGProps<SVGPathElement>, "style"> {
    geography: GeographyShape;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    className?: string;
    style?: {
      default?: GeographyStyleProps;
      hover?: GeographyStyleProps;
      pressed?: GeographyStyleProps;
    };
    onMouseEnter?: (event: React.SyntheticEvent) => void;
    onMouseMove?: (event: React.SyntheticEvent) => void;
    onMouseLeave?: (event: React.SyntheticEvent) => void;
    onClick?: (event: React.SyntheticEvent) => void;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
}
