# update       nix flake update
# shell        nix develop
# IDE          nix run .#codium
# single test  nix run .#grep 'base layout'
# show report  nix run .#report
# if experimental features not enabled add: --experimental-features 'nix-command flakes'
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      deps = with pkgs; [kubernetes-helm jq kubectl nodejs_20];
      playwright-env = ''
        export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright.browsers}
        export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
      '';
      cd-and-packages = ''
        # run in the work tree using node_modules/ from the work tree
        # to enable automatic Renovate Bot updates
        git rev-parse --is-inside-work-dir
        cd "$(git rev-parse --show-toplevel)"/e2e

        # automatic initial setup, no updates
        [[ -e node_modules ]] || npm ci
      '';
    in {
      packages = rec {
        run = pkgs.writeShellApplication {
          name = "run.sh";
          runtimeInputs = deps;
          text = ''
            ${cd-and-packages}
            ${playwright-env}
            exec ${./.}/run.sh "$@"
          '';
        };

        default = run;

        grep = pkgs.runCommandNoCC "playwright-grep" {buildInputs = [pkgs.makeWrapper];} ''
          makeWrapper ${self.packages.${system}.run}/bin/run.sh $out/bin/playwright-grep \
            --set-default PLAYWRIGHT_HTML_OPEN never \
            --add-flags '--trace on' \
            --add-flags '--project chromium -g'
        '';

        report = pkgs.writeShellApplication {
          name = "playwright-report";
          runtimeInputs = deps;
          text = ''
            ${cd-and-packages}
            exec npx playwright show-report
          '';
        };

        codium = pkgs.writeShellApplication {
          name = "codium-e2e";
          runtimeInputs = [
            (pkgs.vscode-with-extensions.override {
              vscode = pkgs.vscodium;
              vscodeExtensions = pkgs.vscode-utils.extensionsFromVscodeMarketplace [
                {
                  name = "playwright";
                  publisher = "ms-playwright";
                  version = "1.1.7";
                  hash = "sha256-jbMgEzogc/rZskV7WbxRYfCeIKAcZS2ZMPEdO4jAotk=";
                }
              ];
            })
          ];
          text = ''
            ${self.devShells.${system}.default.shellHook}
            (($#)) || set . # default to `codium .`
            exec codium "$@"
          '';
        };
      };

      devShells.default = pkgs.mkShell {
        nativeBuildInputs = deps ++ [self.packages.${system}.codium];
        shellHook = ''
          ${cd-and-packages}
          ${playwright-env}

          env=$(./env.sh)
          set -a
          eval "$env"
          set +a

          cat <<.
          * inputs:
            * context: $CONTEXT
            * namespace: $NAMESPACE
            * stage: $STAGE
          * environment:
          $(sed 's/^/  * /;s/=/: /' <<<"$env")
          * use vscode's playwright extension to create tests
          * a VSCodium installation with that plugin is available as "codium-e2e"
          .
        '';
      };
    });
}
