# nix run . presentation_name
# example: nix run . authz
# if experimental features not enabled add: --experimental-features 'nix-command flakes'
{
  description = "R markdown presentation render script";
  inputs.nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-24.05";

  outputs = {nixpkgs, ...}: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    packages.${system} = let
      name = "render-rmd-presentation";
      script = with pkgs;
        writeShellApplication {
          inherit name;
          runtimeInputs = [(rWrapper.override {packages = with rPackages; [rmarkdown DiagrammeR xaringan xaringanthemer xaringanExtra];})];
          text = ''Rscript -e 'rmarkdown::render(paste0(commandArgs(trailingOnly = TRUE)[1], ".Rmd"))' "$1"'';
        };
    in {
      ${name} = script;
      default = script;
    };
  };
}
