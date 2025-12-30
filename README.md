# Photoshop AI Tools

A collection of tools and plugins for image processing in Adobe Photoshop.

## Project Structure

- **[PM_Tools](PM_Tools/)**: The main UXP plugin for Photoshop v23.0+.
  - **Smart Resize**: Scales images to cover target resolutions.
  - **Activate Crop**: Automates crop handles with target aspect ratios.
- **[legacy](legacy/)**: Original ExtendScript (`.jsx`) versions of the tools.
- **[release](release/)**: Compiled `.ccx` versions for easy installation.

## Requirements

- Adobe Photoshop 2022 (v23.0) or newer (for UXP plugin).
- Adobe UXP Developer Tool (for development).

## Installation

To install the UXP plugin, double-click the `.ccx` file in the `release` folder or load the `PM_Tools` folder via UDT.
