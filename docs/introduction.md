---
sidebar_position: 1
slug: /introduction
---

# 产品简介

RDK™ IMU 模组采用 Bosch Sensortec 推出的高性能 6 轴惯性测量单元（IMU）BMI088 实现，包含一个三轴陀螺仪和一个三轴加速度计，均为 16 位精度。BMI088 专为要求高精度和抗振性能的应用场景而设计，尤其适合无人机、机器人等强震动环境中使用。BMI088 具备 ±24g 加速度和 ±2000°/s 角速度的扩展量程，具有优异的温漂表现（低 TCO/TCS），出厂已校准，可实现高稳定性的姿态与运动感知。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_product_overview.png" alt="RDK IMU 模组示意图" width="80%" />

## 适用板卡

下表列举了本产品与 RDK 开发者套件板卡产品的兼容性情况：

| 板卡名称 | 支持情况 | 说明 |
| --- | --- | --- |
| RDK X3 | 不支持 | - |
| RDK X3 Module | 不支持 | - |
| RDK X5 | 支持 | - |
| RDK X5 Module | 支持 | - |
| RDK S100/S100P | 支持 | 无法直接安装，需跳线 |
| RDK S600 | 支持 | 无法直接安装，需跳线 |
| 其他具有 40PIN 接口的开发板产品 | 支持 | 需用户自行适配驱动 |

## 硬件接口

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_hardware_interfaces.png" alt="RDK IMU 硬件接口" width="80%" />

1. 40PIN 接口：用于对接开发板 40PIN 排针，是连接 IMU 模组与开发板的唯一接口。
2. 通信方式选择接口：一组 3×5 排针，使用跳线帽短接的方式选择模组的通信方式（I2C/SPI）。
3. IMU 核心板接口：一组 2×7 排针排母用于连接 IMU 模组核心板和 IMU 模组载板。
4. 指示灯：板载 3 颗 LED，可用于模组状态指示。
5. 蜂鸣器：板载有源蜂鸣器，可用于模组状态指示。
6. 温度传感器：板载 1-Wire 接口的温度传感器，用于检测环境温度或载板温度。

详细说明见 [硬件说明](./04_hardware.md)。

## 关键参数

| 名称 | 描述 |
| --- | --- |
| 加速度计量程 | ± 3 / 6 / 12 / 24 g |
| 陀螺仪量程 | ± 125 / 250 / 500 / 1000 / 2000 dps |
| 加速度计零偏 | 20 mg |
| 陀螺仪零偏 | 0.5 dps |
| 加速度计采样频率 | 12.5 / 25 / 50 / 100 / 200 / 400 / 800 / 1600 Hz |
| 陀螺仪采样频率 | 100 / 200 / 400 / 1000 / 2000 Hz |
| 数据分辨率 | 16 bit |
| 通信接口 | I2C / SPI |
