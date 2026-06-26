let
  pkgs = import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/cc54fb41d13736e92229c21627ea4f22199fee6b.tar.gz") {};
  unstable = import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/2741b4b489b55df32afac57bc4bfd220e8bf617e.tar.gz") {};
in
  pkgs.mkShell {
    buildInputs = [
      pkgs.nodejs_20
      unstable.nodePackages.pnpm
    ];

    shellHook = ''
      echo "Nix shell with Node v20 and pnpm v9"
    '';
  }
