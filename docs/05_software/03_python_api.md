---
sidebar_position: 3
title: 3.5.2 Python-API 使用说明
---

# Python-API 使用说明

## 文件结构

RDK IMU Module SDK 的 Python 部分位于 `rdk-imu-module-sdk/python`，它以 C-API 为依赖，`python` 目录内容如下：

构建前：

```text
python/
├── examples
│   ├── imu_stress_test.py  # 压力测试
│   └── test_imu.py         # 简单测试
├── Makefile                # 构建工具
├── rdkimu
│   ├── imu.py              # API 接口类型封装
│   └── __init__.py         # API 导出
└── setup.py                # 构建脚本
```

构建后：

```text
python/
├── build/                  # 构建过程文件
├── dist/                   # 安装包，内含一个 .whl 包
├── examples/
├── Makefile
├── rdkimu/
├── rdkimu.egg-info/        # python 包说明文件
└── setup.py
```

## 构建方法

构建 Python-API 前，必须保证 SDK 的 C-API 的动态库已被编译，即 `core/lib` 中的 `.so`、`.so.x` 和 `.so.x.x.x` 都存在。Python-API 依赖该动态库文件，但无需用户手动移动，Makefile 会自动检测并包含到 `.whl` 包中。

在 `python` 目录下：

- 使用 `make` 命令可以进行全量构建，主要的构建产物是 `python/dist/*.whl`。
- 使用 `make install` 命令可以将 `.whl` 包安装到系统的 Python 路径中，以便在其他目录使用 API。
- 使用 `make uninstall` 命令可以卸载 `.whl` 包。
- 使用 `make clean` 命令可以清除构建产物。

## 接口说明

Python API 通过 `ctypes` 封装 C 动态库，提供面向对象的 `IMU` 类。所有方法在出错时抛出 `RuntimeError` 异常，正常返回对应数据。

### 类 `IMU`

```python
from rdkimu import IMU
```

**构造方法：**

```python
imu = IMU()                          # 自动查找 librdkimu.so
imu = IMU(lib_path="./librdkimu.so") # 指定库路径
```

- 自动加载 C 库并创建设备句柄。
- 若库加载失败（找不到 `librdkimu.so`），抛出 `RuntimeError`。

方法调用顺序与 C-API 完全一致：`bus()` → `config()` → `enable()` → `read_*()` → `disable()` → 程序结束自动释放。

### 1. 总线配置

使用 `.bus` 方法：

```python
def bus(self,
        interface=RDK_IMU_INTERFACE.AUTO,
        i2c_accel_bus=0, i2c_accel_addr=0x18,
        i2c_gyro_bus=0, i2c_gyro_addr=0x68,
        spi_accel_bus=0, spi_accel_cs=0, spi_accel_speed=1000000,
        spi_gyro_bus=0, spi_gyro_cs=1, spi_gyro_speed=1000000):
```

- `interface`：通信接口，默认 `AUTO` 自动扫描，亦可指定 `I2C` 或 `SPI`。
- 若使用自动扫描，无需填写设备地址；若指定 I2C/SPI，可通过关键字参数传入具体总线号、地址、片选、速率等。

### 2. 设备配置

使用 `.config` 方法：

```python
def config(self, config_dict):
```

- `config_dict`：Python 字典，包含全部或部分配置项。键名与 `RDK_IMU_CONFIG` 结构体成员相同。
- SDK 预置了常用开发板的默认配置字典，可直接使用：`RDK_X5_DEFAULT_CONFIG`。
- 允许部分覆盖，例如只更改加速度计量程：

```python
from rdkimu import IMU, RDK_X5_DEFAULT_CONFIG
from rdkimu.imu import RDK_IMU_ACCEL_RANGE

my_config = dict(RDK_X5_DEFAULT_CONFIG)
my_config['accel_range'] = RDK_IMU_ACCEL_RANGE.RANGE_12G
imu.config(my_config)
```

配置字典支持的键及取值与 C-API 相同，详见 [C-API 使用说明](./02_c_api.md) 中的 `rdk_imu_config_t` 表格。常用的键包括：`accel_odr`、`accel_range`、`gyro_range`、`gyro_bandwidth`、`fifo_length` 等。

### 3. 设备使能与关闭

使用 `.enable()` 和 `.disable()` 方法可以使能和关闭 IMU 设备：

```python
imu.enable()   # 启动中断线程，开始填充 FIFO
imu.disable()  # 停止数据采集
```

`enable()` 可重复调用，但只有第一次会生效，后续返回错误（由 C 库保证线程安全）。

### 4. 读取数据

查询 FIFO 余量：

```python
count = imu.fifo_available()  # 返回当前 FIFO 中可读帧数
```

读取独立数据包（加速度计或陀螺仪单侧数据）：

```python
data, remaining = imu.read_indep()
```

- `data`：`RDK_IMU_6_AXIS_DATA` 对象，通过 `data.accel.valid` 和 `data.gyro.valid` 判断哪侧有效。
- `remaining`：读取后 FIFO 中剩余帧数。

读取融合数据包（插值后的 6 轴数据）：

```python
data = imu.read_fused(fuse_by=RDK_IMU_DEVICE.ACCEL, max_age_ns=50000000)
```

- `fuse_by`：指定以加速度计（`RDK_IMU_DEVICE.ACCEL`）或陀螺仪（`RDK_IMU_DEVICE.GYRO`）的时间戳为基准。
- `max_age_ns`：允许的最大插值时间窗口（纳秒）。超过此窗口会阻塞等待，建议设为 ODR 周期的 3 倍以上（例如 400 Hz 时，周期 2.5 ms，可设为 7500000 ns）。

### 5. 数据包使用

`RDK_IMU_6_AXIS_DATA` 包含两个 `RDK_IMU_3_AXIS_DATA` 成员：

- `data.accel`：加速度计数据（`x, y, z, timestamp_ns, valid`）。
- `data.gyro`：陀螺仪数据（`x, y, z, timestamp_ns, valid`）。

其中：

- `x, y, z`：`float`，加速度单位为 m/s²，陀螺仪单位为 °/s。
- `timestamp_ns`：`int`，硬件时间戳（纳秒），基于 `CLOCK_MONOTONIC`；
- `valid`：`int`，0 表示数据有效。

### 6. 资源释放

建议使用上下文管理器自动清理，或显式调用 `imu.close()`：

```python
with IMU() as imu:
    imu.bus()
    imu.config(RDK_X5_DEFAULT_CONFIG)
    imu.enable()
    data = imu.read_fused()
```

离开 `with` 块时会自动禁用设备、释放总线与句柄。若不使用上下文，程序结束时也应调用 `imu.close()` 或至少 `imu.disable()`。
