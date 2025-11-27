# 图片转换和压缩工具

这个Python脚本可以将HEIC和JPG格式的图片转换为PNG或JPEG格式，并进行压缩和尺寸调整。

## 功能特点

✅ **格式转换**: HEIC/JPG/JPEG → PNG 或 JPEG
✅ **尺寸调整**: 默认600x400像素（保持宽高比）
✅ **强力压缩**:
- PNG: 使用最高压缩级别(9) + 可选pngquant额外压缩
- JPEG: 可调质量设置（默认50）
✅ **批量处理**: 自动处理文件夹中所有HEIC和JPG文件
✅ **详细报告**: 显示每个文件的压缩比例和总体统计

## 安装依赖

```bash
# 安装Python包
pip3 install -r requirements.txt

# （可选）安装pngquant以获得更好的PNG压缩
# macOS:
brew install pngquant

# Ubuntu/Debian:
sudo apt-get install pngquant

# Windows:
# 从 https://pngquant.org/ 下载
```

## 使用方法

1. 将HEIC或JPG图片放在此文件夹中
2. 运行脚本：

```bash
python3 compress.py
```

## 配置选项

编辑 `compress.py` 文件顶部的配置：

```python
TARGET_WIDTH = 600          # 目标宽度（像素）
TARGET_HEIGHT = 400         # 目标高度（像素）
JPEG_QUALITY = 50          # JPEG质量 (0-100)
PNG_COMPRESSION = 5        # PNG压缩级别 (0-9)
MAINTAIN_ASPECT_RATIO = True  # 保持宽高比
OUTPUT_FORMAT = 'PNG'      # 输出格式: 'PNG' 或 'JPEG'
```

### 格式选择建议

**PNG格式** (推荐用于菜单图片):
- 无损压缩，质量最好
- 支持透明背景
- 文件稍大（但使用pngquant后也很小）
- 适合需要高质量的场景

**JPEG格式** (如果需要更小的文件):
- 有损压缩，文件最小
- 不支持透明背景
- 质量85时视觉效果仍然很好
- 适合对文件大小要求严格的场景

## 压缩效果

典型的压缩效果：
- **不使用pngquant**: 原始图片 → PNG，减少约30-50%
- **使用pngquant**: 原始图片 → PNG，减少约60-80%
- **使用JPEG**: 原始图片 → JPEG，减少约70-85%

## 示例输出

```
Found 8 image file(s) to convert
Target size: 600x400 (aspect ratio: preserved)
Output format: PNG
Compression: Maximum PNG (level 5)
------------------------------------------------------------
✓ Converted: IMG_9064.HEIC
  Original: 2456.3 KB → New: 487.2 KB (80.2% reduction)
  Dimensions: 600x400
  Extra compression: pngquant applied

...

------------------------------------------------------------
Conversion complete: 8/8 files converted successfully

Total size: 19650.4 KB → 3896.8 KB
Overall compression: 80.2%

Note: Original HEIC files are preserved. You can delete them manually if needed.

✓ pngquant is installed - extra compression applied
```

## 注意事项

- 原始图片文件会被保留，转换后可以手动删除
- 如果没有安装pngquant，脚本仍然可以工作，只是压缩效果稍差
- 建议先用几张图片测试，确认效果满意后再批量处理
- JPG文件会被压缩和调整尺寸，适合优化现有的JPG图片
- HEIC文件需要pillow-heif库支持，JPG文件只需要PIL即可