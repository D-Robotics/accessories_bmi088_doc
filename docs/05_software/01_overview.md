---
sidebar_position: 1
---

# 3.5 软件说明

接入 IMU 模组后，在 RDK 平台中，可以使用官方针对 BMI088 适配好的 Linux IIO 驱动来加载 IMU 设备，通过操作 IMU 相关字符设备文件来获取 IMU 数据。

此外，还可以使用 RDK IMU Module SDK。SDK 同时支持 C 语言、Python3 和 ROS2 接口可供开发者选择。它不局限于 RDK 平台，不依赖 IIO 驱动，无需进行系统级开发，使用 Linux I2C/SPI 用户态接口读写设备数据，并以软件 FIFO、用户态 GPIO 外部中断、以及实时子线程的方式，实现了精确的硬件时间戳功能。理论上只要是内核高于 Linux 5.10 的 aarch64 架构设备，具有标准用户态 I2C/SPI 外设即可使用。

rdk-imu-module-sdk 代码仓库托管于 Github 平台：[rdk-imu-module-sdk](https://github.com/D-Robotics/rdk-imu-module-sdk)

在开发板中克隆 rdk-imu-module-sdk 代码仓库的主分支：

```bash
git clone https://github.com/D-Robotics/rdk-imu-module-sdk.git
```

主要内容如下：

```text
rdk-imu-module-sdk/
├── core             # C 封装与示例
├── python           # Python 封装与示例
├── ros2             # ROS2 封装与示例
├── Makefile         # 构建 Makefile
├── doc
├── README_cn.md
├── README.md
├── LICENSE          # MIT License
└── version          # 版本信息
```
