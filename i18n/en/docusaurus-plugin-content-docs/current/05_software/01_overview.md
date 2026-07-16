---
sidebar_position: 1
---

# 3.5 Software Guide

After connecting the IMU module on an RDK platform, you can load the device with the official Linux IIO driver adapted for BMI088 and read IMU data through the corresponding character device files.

Alternatively, use the RDK IMU Module SDK, which provides C, Python3, and ROS2 interfaces. It is not limited to RDK platforms, does not depend on the IIO driver, and avoids system-level driver development. It reads device data through Linux user-space I2C/SPI, and implements precise hardware timestamps via a software FIFO, user-space GPIO external interrupts, and a real-time worker thread. In theory, any aarch64 device running Linux kernel 5.10 or later with standard user-space I2C/SPI peripherals can use it.

The rdk-imu-module-sdk repository is hosted on GitHub: [rdk-imu-module-sdk](https://github.com/D-Robotics/rdk-imu-module-sdk)

Clone the main branch on your development board:

```bash
git clone https://github.com/D-Robotics/rdk-imu-module-sdk.git
```

Main contents:

```text
rdk-imu-module-sdk/
├── core             # C wrapper and examples
├── python           # Python wrapper and examples
├── ros2             # ROS2 wrapper and examples
├── Makefile         # Build Makefile
├── doc
├── README_cn.md
├── README.md
├── LICENSE          # MIT License
└── version          # Version info
```
