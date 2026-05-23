{pkgs}: {
  deps = [
    pkgs.xorg.libxcb
    pkgs.xorg.libXrandr
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcomposite
    pkgs.xorg.libX11
    pkgs.nss
    pkgs.chromium
  ];
}
