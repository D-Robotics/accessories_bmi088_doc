---
sidebar_position: 1
slug: /introduction
---

# Product Overview

The RDK™ IMU Module is built around the Bosch Sensortec BMI088, a high-performance 6-axis inertial measurement unit (IMU) that combines a 3-axis gyroscope and a 3-axis accelerometer, both with 16-bit resolution. BMI088 is designed for applications that demand high accuracy and vibration resistance, making it well suited for drones, robots, and other environments with strong vibration. It offers extended ranges of ±24 g acceleration and ±2000°/s angular velocity, excellent temperature drift performance (low TCO/TCS), and factory calibration for stable attitude and motion sensing.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_product_overview.png" alt="RDK IMU Module overview" width="80%" />

## Supported Boards

The following table lists compatibility with RDK developer kit boards:

| Board | Support | Notes |
| --- | --- | --- |
| RDK X3 | Not supported | - |
| RDK X3 Module | Not supported | - |
| RDK X5 | Supported | - |
| RDK X5 Module | Supported | - |
| RDK S100/S100P | Supported | Cannot be mounted directly; jumper wires required |
| RDK S600 | Supported | Cannot be mounted directly; jumper wires required |
| Other boards with a 40-pin header | Supported | Driver adaptation required by the user |

## Hardware Interfaces

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_hardware_interfaces.png" alt="RDK IMU hardware interfaces" width="80%" />

1. **40-pin header**: Connects to the development board 40-pin header; the only interface between the IMU module and the board.
2. **Communication mode selector**: A 3×5 pin header; use jumper caps to select I2C or SPI.
3. **IMU core board connector**: A 2×7 pin header/socket pair connecting the IMU core board to the carrier board.
4. **Indicator LEDs**: Three onboard LEDs for module status indication.
5. **Buzzer**: An onboard active buzzer for module status indication.
6. **Temperature sensor**: A 1-Wire temperature sensor for ambient or carrier board temperature.

See [Hardware Reference](./04_hardware.md) for details.

## Key Specifications

| Parameter | Description |
| --- | --- |
| Accelerometer range | ± 3 / 6 / 12 / 24 g |
| Gyroscope range | ± 125 / 250 / 500 / 1000 / 2000 dps |
| Accelerometer offset | 20 mg |
| Gyroscope offset | 0.5 dps |
| Accelerometer sample rate | 12.5 / 25 / 50 / 100 / 200 / 400 / 800 / 1600 Hz |
| Gyroscope sample rate | 100 / 200 / 400 / 1000 / 2000 Hz |
| Data resolution | 16 bit |
| Communication interface | I2C / SPI |
