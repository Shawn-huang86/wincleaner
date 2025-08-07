# 🎨 WinCleaner 图标制作指南

## 📁 当前状态

项目中已包含：
- `electron/assets/icon.svg` - 源图标文件（矢量格式）

## 🔄 需要生成的图标文件

为了完整支持所有平台，需要以下格式的图标：

### Windows (.ico)
- `electron/assets/icon.ico` - 256x256 像素
- 包含多个尺寸：16x16, 32x32, 48x48, 64x64, 128x128, 256x256

### macOS (.icns)
- `electron/assets/icon.icns` - 512x512 像素
- 包含多个尺寸的图标集

### 通用 (.png)
- `electron/assets/icon.png` - 512x512 像素
- `electron/assets/tray-icon.png` - 16x16 像素（系统托盘）

## 🛠️ 图标转换方法

### 方法一：在线转换工具（推荐）

#### 1. 转换为 PNG
1. 访问 [CloudConvert](https://cloudconvert.com/svg-to-png)
2. 上传 `icon.svg`
3. 设置尺寸为 512x512
4. 下载并重命名为 `icon.png`

#### 2. 转换为 ICO
1. 访问 [ICO Convert](https://icoconvert.com/)
2. 上传刚才生成的 `icon.png`
3. 选择多尺寸选项
4. 下载并重命名为 `icon.ico`

#### 3. 转换为 ICNS
1. 访问 [CloudConvert](https://cloudconvert.com/png-to-icns)
2. 上传 `icon.png`
3. 下载并重命名为 `icon.icns`

#### 4. 制作托盘图标
1. 访问 [ResizeImage](https://resizeimage.net/)
2. 上传 `icon.png`
3. 调整为 16x16 像素
4. 下载并重命名为 `tray-icon.png`

### 方法二：使用 ImageMagick（命令行）

如果您安装了 ImageMagick：

```bash
# 生成 PNG
magick icon.svg -resize 512x512 icon.png

# 生成小尺寸 PNG
magick icon.svg -resize 16x16 tray-icon.png

# 生成 ICO（多尺寸）
magick icon.svg -resize 256x256 icon.ico

# 生成 ICNS（需要额外工具）
# macOS: iconutil -c icns icon.iconset
```

### 方法三：使用 Photoshop/GIMP

1. 打开 `icon.svg`
2. 导出为不同尺寸的 PNG
3. 使用插件转换为 ICO/ICNS

## 📋 文件清单

完成后，`electron/assets/` 目录应包含：

```
electron/assets/
├── icon.svg          ✅ 已有（源文件）
├── icon.png          ❌ 需要生成（512x512）
├── icon.ico          ❌ 需要生成（256x256，多尺寸）
├── icon.icns         ❌ 需要生成（512x512）
├── tray-icon.png     ❌ 需要生成（16x16）
└── README.md         ✅ 已有
```

## 🎯 图标设计说明

当前图标设计包含：
- 🔵 蓝色圆形背景（代表专业、可信）
- 🧹 清理刷子（代表清理功能）
- ⭐ 清理效果（星星和圆点）
- 🔤 字母 "C"（WinCleaner 首字母）

## 🚀 快速开始

### 最简单的方法：
1. 下载 [icon.svg](electron/assets/icon.svg)
2. 访问 [Favicon Generator](https://www.favicon-generator.org/)
3. 上传 SVG 文件
4. 下载生成的图标包
5. 将对应文件复制到 `electron/assets/` 目录

### 临时解决方案：
如果暂时没有图标文件，应用仍然可以正常打包和运行，只是会使用 Electron 的默认图标。

## ✅ 验证图标

生成图标后，可以通过以下方式验证：

1. **Windows**: 双击 `.ico` 文件查看
2. **macOS**: 在 Finder 中预览 `.icns` 文件
3. **通用**: 在浏览器中打开 `.png` 文件

## 🎨 自定义图标

如果您想自定义图标：

1. 编辑 `icon.svg` 文件
2. 修改颜色、形状或文字
3. 重新生成所有格式的图标
4. 重新打包应用

## 📝 注意事项

- 图标文件名必须完全匹配
- ICO 文件应包含多个尺寸以获得最佳效果
- 托盘图标应使用简单的单色设计
- 所有图标应保持一致的设计风格
