import Image from "next/image";

type ThemeLogoProps = {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

export function ThemeLogo({ width, height, className, priority = false }: ThemeLogoProps) {
  return (
    <>
      <Image
        src="/logos/fyntix-logo-light.png"
        alt="Fyntix"
        width={width}
        height={height}
        className={`block dark:hidden ${className ?? ""}`}
        priority={priority}
      />
      <Image
        src="/logos/fyntix-logo-dark.png"
        alt="Fyntix"
        width={width}
        height={height}
        className={`hidden dark:block ${className ?? ""}`}
        priority={priority}
      />
    </>
  );
}
