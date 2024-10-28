{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs  # installs node and npm
    (pkgs.nodePackages.npm-check-updates)
  ];
}
