#!/usr/bin/env python3
"""
HEIC to PNG Converter with Advanced Compression
Converts HEIC images to PNG format, resizes them, and applies aggressive compression
"""

import os
import subprocess
from pathlib import Path
from PIL import Image
import pillow_heif

# Configuration
TARGET_WIDTH = 600  # Target width in pixels (adjust as needed)
TARGET_HEIGHT = 400  # Target height in pixels (adjust as needed)
JPEG_QUALITY = 50  # JPEG quality (0-100) - for JPG output
PNG_COMPRESSION = 5  # PNG compression level (0-9, 9 is maximum)
MAINTAIN_ASPECT_RATIO = True  # Keep original aspect ratio
OUTPUT_FORMAT = 'PNG'  # 'PNG' or 'JPEG' (JPEG is smaller but lossy)

def compress_with_pngquant(png_path):
    """
    Use pngquant for additional PNG compression (lossy but high quality)
    
    Args:
        png_path: Path to PNG file to compress
    
    Returns:
        bool: True if compression succeeded
    """
    try:
        # Check if pngquant is available
        result = subprocess.run(['pngquant', '--version'],
                              capture_output=True,
                              text=True)
        
        # Run pngquant with quality settings
        # --quality 65-80: quality range (lower = smaller file)
        # --speed 1: slower but better compression
        # --force: overwrite existing file
        subprocess.run([
            'pngquant',
            '--quality', '65-80',
            '--speed', '1',
            '--force',
            '--output', str(png_path),
            str(png_path)
        ], check=True, capture_output=True)
        
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        # pngquant not available or failed, skip this step
        return False

def convert_heic_to_compressed(input_path, output_path, target_size=(TARGET_WIDTH, TARGET_HEIGHT)):
    """
    Convert HEIC image to compressed PNG/JPEG with resizing
    
    Args:
        input_path: Path to input HEIC file
        output_path: Path to output file
        target_size: Tuple of (width, height) for target dimensions
    """
    try:
        # Register HEIF opener with Pillow
        pillow_heif.register_heif_opener()
        
        # Open HEIC image
        img = Image.open(input_path)
        
        # Convert to RGB if necessary
        if img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        
        # Resize image
        if MAINTAIN_ASPECT_RATIO:
            # Calculate aspect ratio preserving dimensions
            img.thumbnail(target_size, Image.Resampling.LANCZOS)
        else:
            # Resize to exact dimensions
            img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        # Save with appropriate format and compression
        pngquant_success = False
        if OUTPUT_FORMAT.upper() == 'JPEG' or OUTPUT_FORMAT.upper() == 'JPG':
            # Save as JPEG with quality setting
            output_path = output_path.with_suffix('.jpg')
            img.save(output_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
        else:
            # Save as PNG with maximum compression
            output_path = output_path.with_suffix('.png')
            img.save(output_path, 'PNG', optimize=True, compress_level=PNG_COMPRESSION)
            
            # Try additional compression with pngquant
            pngquant_success = compress_with_pngquant(output_path)
        
        # Get file sizes for reporting
        original_size = os.path.getsize(input_path) / 1024  # KB
        new_size = os.path.getsize(output_path) / 1024  # KB
        compression_ratio = (1 - new_size / original_size) * 100
        
        print(f"✓ Converted: {input_path.name}")
        print(f"  Original: {original_size:.1f} KB → New: {new_size:.1f} KB ({compression_ratio:.1f}% reduction)")
        print(f"  Dimensions: {img.size[0]}x{img.size[1]}")
        if OUTPUT_FORMAT.upper() == 'PNG' and pngquant_success:
            print(f"  Extra compression: pngquant applied")
        
        return True
        
    except Exception as e:
        print(f"✗ Error converting {input_path.name}: {str(e)}")
        return False

def main():
    """Main function to process all HEIC files in current directory"""
    
    # Get current directory
    current_dir = Path(__file__).parent
    
    # Find all HEIC files
    heic_files = list(current_dir.glob('*.HEIC')) + list(current_dir.glob('*.heic'))
    
    if not heic_files:
        print("No HEIC files found in the current directory.")
        return
    
    print(f"Found {len(heic_files)} HEIC file(s) to convert")
    print(f"Target size: {TARGET_WIDTH}x{TARGET_HEIGHT} (aspect ratio: {'preserved' if MAINTAIN_ASPECT_RATIO else 'exact'})")
    print(f"Output format: {OUTPUT_FORMAT}")
    print(f"Compression: {'Maximum PNG (level 9)' if OUTPUT_FORMAT.upper() == 'PNG' else f'JPEG Quality {JPEG_QUALITY}'}")
    print("-" * 60)
    
    # Convert each file
    success_count = 0
    total_original_size = 0
    total_new_size = 0
    
    for heic_file in heic_files:
        # Create output filename
        if OUTPUT_FORMAT.upper() == 'JPEG' or OUTPUT_FORMAT.upper() == 'JPG':
            output_file = heic_file.with_suffix('.jpg')
        else:
            output_file = heic_file.with_suffix('.png')
        
        # Get original size
        original_size = os.path.getsize(heic_file) / 1024
        total_original_size += original_size
        
        # Convert
        if convert_heic_to_compressed(heic_file, output_file):
            success_count += 1
            new_size = os.path.getsize(output_file) / 1024
            total_new_size += new_size
        print()
    
    print("-" * 60)
    print(f"Conversion complete: {success_count}/{len(heic_files)} files converted successfully")
    
    if success_count > 0:
        total_compression = (1 - total_new_size / total_original_size) * 100
        print(f"\nTotal size: {total_original_size:.1f} KB → {total_new_size:.1f} KB")
        print(f"Overall compression: {total_compression:.1f}%")
        print("\nNote: Original HEIC files are preserved. You can delete them manually if needed.")
        
        # Check if pngquant is available
        if OUTPUT_FORMAT.upper() == 'PNG':
            try:
                subprocess.run(['pngquant', '--version'],
                             capture_output=True,
                             check=True)
                print("\n✓ pngquant is installed - extra compression applied")
            except (subprocess.CalledProcessError, FileNotFoundError):
                print("\n⚠ pngquant not found - install it for even better compression:")
                print("  macOS: brew install pngquant")
                print("  Ubuntu/Debian: sudo apt-get install pngquant")
                print("  Windows: Download from https://pngquant.org/")

if __name__ == "__main__":
    # Check if required packages are installed
    try:
        import pillow_heif
        from PIL import Image
    except ImportError as e:
        print("Error: Required packages not installed.")
        print("\nPlease install required packages:")
        print("  pip install pillow pillow-heif")
        print("\nOr if using pip3:")
        print("  pip3 install pillow pillow-heif")
        exit(1)
    
    main()

# Made with Bob
