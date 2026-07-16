---
sidebar_position: 4
---

# 3.4 硬件说明

## 结构安装说明

RDK IMU 模组核心板拥有 1 个 2×7 排针接口和 4 个安装孔，可以将其接入 RDK IMU 模组载板的 2×7 排母，并使用 4 颗 M2.5×11 铜柱和若干螺栓固定，或自制其他支撑结构安装，RDK IMU 模组核心板尺寸示意图下（Unit：mm）。

![RDK IMU 结构安装](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_structure_installation.png)

RDK IMU 模组载板拥有 1 个 2×7 排母接口和 4 个安装孔用于连接核心板；此外还拥有 1 个 40PIN 排母接口和 3 个安装孔，用于接入开发板并使用 3 颗 M2.5×11 铜柱和若干螺栓固定，或自制其他支撑结构安装，RDK IMU 模组载板尺寸示意图下（Unit：mm）。

![RDK IMU 结构尺寸](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_structure_dimensions.png)

## 硬件接口说明

### 硬件拓扑

下图示意 RDK IMU 模组与 RDK 开发板的硬件拓扑关系。

![RDK IMU 硬件拓扑](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_hardware_topology.png)

### 器件型号

![RDK IMU 器件型号](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_component_models.png)

| 器件 | 器件型号 |
| --- | --- |
| 1 | 2.54mm，2×20P 排母 |
| 2 | 2.54mm，3×5P 排针 |
| 3 | 2.54mm，2×7P 排针&排母 |
| 4 | 0603 LED R/G/B |
| 5 | YS-SBZ9650DYB05 |
| 6 | DS18B20 |

### 接口描述

#### ① 40PIN 接口

该接口用于对接开发板 40PIN 排针，是连接 IMU 模组与开发板的唯一接口。  
该接口的 PIN1 脚定义与 RDK X5 一致，下表为接口定义说明。

| Desc | Name | Pin | Pin | Name | Desc |
| --- | --- | --- | --- | --- | --- |
| | 3V3 | 1 | 2 | 5V | |
| Used for SPI/I2C | SDA/SDI | 3 | 4 | 5V | |
| Used for SPI/I2C  |SCL/SCK | 5 | 6 | N/A | |
| | N/A | 7 | 8 | N/A | |
| Ground | GND | 9 | 10 | N/A | |
| | LED | 11 | 12 | N/A | |
| | LED | 13 | 14 | N/A | |
| | LED | 15 | 16 | N/A | |
| | 3V3 | 17 | 18 | N/A | |
| Used for SPI/I2C  |SDA/SDI | 19 | 20 | N/A | |
| Used for SPI  |SDO | 21 | 22 | N/A | |
| Used for SPI/I2C  |SCL/SCK | 23 | 24 | CS_ACCEL | Used for SPI |
| Ground | GND | 25 | 26 | CS_GYRO | Used for SPI |
| | N/A | 27 | 28 | N/A | |
| | N/A | 29 | 30 | N/A | |
| | BUZZ | 31 | 32 | N/A | |
| | N/A | 33 | 34 | N/A | |
| | N/A | 35 | 36 | INT1 | Used for Interrupt |
| Connect DS18B20  | DQ| 37 | 38 | INT3 | Used for Interrupt |
| | GND | 39 | 40 | N/A | |

#### ② 通信方式选择接口

该接口用于切换 RDK IMU 模组的通信方式，使用 5 个跳线帽将中间 5PIN 排针与 “I2C” 丝印一侧 5PIN 排针连接，即可选择 I2C 通信，如下图所示：

![I2C 通信方式选择](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_comm_i2c.png)

将中间 5PIN 排针与 “SPI” 丝印一侧 5PIN 排针连接，即可选择 SPI 通信，如下图所示：

![SPI 通信方式选择](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_comm_spi.png)

#### ③ IMU 核心板接口

该接口用于连接 IMU 模组核心板和 IMU 模组载板。

#### ④ 指示灯

RDK IMU 载板搭载 3 颗 LED，可用于模组状态指示，使用 40PIN GPIO 驱动。

#### ⑤ 蜂鸣器

RDK IMU 载板搭载有源蜂鸣器，可用于模组状态指示。

#### ⑥ 温度传感器

RDK IMU 载板搭载一颗 DS18B20 温度传感器，这是一颗使用 1-Wire 总线协议的传感器，可用于检测环境温度或载板温度。
