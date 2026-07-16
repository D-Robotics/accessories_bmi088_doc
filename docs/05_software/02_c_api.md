---
sidebar_position: 2
title: 3.5.1 C-API 使用说明
---

# C-API 使用说明

## 文件结构

RDK IMU Module SDK 的 C 语言部分位于 `rdk-imu-module-sdk/core`，它同时还作为 Python-API 和 ROS2 功能包的依赖，`core` 目录内容如下：

构建前：

```text
core/
├── Makefile         # 构建工具
├── examples/        # 测试用例
├── include
│   └── rdkimu.h     # API 头文件
└── src
    ├── rdkimu_bus.c # 总线抽象源码
    ├── rdkimu.c     # 业务源码
    └── rdkimu_priv.h # 私有头文件
```

构建后：

```text
core/
├── Makefile
├── examples/
├── include/
├── build/           # 编译中间产物
├── lib/             # 构建结果：静态库与动态库
├── out/             # 构建结果：可执行文件
└── src/
```

## 构建方法

在 `core` 目录下：

- 使用 `make` 命令可以进行全量构建，构建产物包括：测试用例的可执行文件、静态库、带软链接的动态库。
- 使用 `make test` 命令可以直接在全量构建后运行 `out/test`。
- 使用 `make install` 命令可以将头文件、静态库、动态库安装到系统路径中，以便在其他目录使用 API。
- 使用 `make uninstall` 命令可以卸载头文件、静态库、动态库。
- 使用 `make clean` 命令可以清除构建产物。

## 接口说明

### 1. 获取句柄

IMU 设备被抽象为句柄，类型为 `rdk_imu_state_t`。在使用 SDK 的过程中，不能直接使用 `rdk_imu_state_t imu_st` 的方式初始化句柄，因为在头文件中 `rdk_imu_state_t` 是一个前向声明，成员均为私有，编译器无法获取它的尺寸信息。

```c
/* 错误用法 */
rdk_imu_state_t imu_st;
```

正确的做法是使用 `rdk_imu_create_default` 获取一个正确初始化的结构体指针，并且接收它的地址：

```c
/* 正确的句柄初始化方法 */
rdk_imu_state_t *imu_st = rdk_imu_create_default();
```

后续对 IMU 的操作，都使用 `rdk_imu_state_t` 结构体指针类型的引用，而非结构体本身。

### 2. 配置总线

`rdk_imu_bus_init` 函数用于自动寻找可用的 IMU 设备，并初始化总线设备，或根据 `bus_info` 的内容初始化总线设备。

```c
rdk_imu_err_t rdk_imu_bus_init(
    rdk_imu_state_t* st,
    rdk_imu_bus_info_t bus_info);
```

支持通过 3 种方式初始化总线：

- 自动在 I2C 和 SPI 之间搜索，自动搜索地址，自动判断 IMU 设备是否在线。对于接入复数 IMU 设备的场景，不能使用该方式。
- 指定通信方式为 I2C，同时指定 IMU 的加速度计和陀螺仪的总线号、设备地址，由软件检查设备是否合法。
- 指定通信方式为 SPI，同时指定 IMU 的加速度计和陀螺仪的总线号、片选号、通信速率，由软件检查设备是否合法。

希望 SDK 自动查找可用的 IMU 设备时，使用以下方式初始化总线：

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_bus_info_t bus_info;
bus_info.interface = RDK_IMU_AUTO;

rdk_imu_err_t ret = rdk_imu_bus_init(imu_st, bus_info);
if (ret != RDK_IMU_OK) return ret;
```

指定 I2C 设备初始化总线：

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_bus_info_t bus_info;
/* 指定通信方式为 I2C */
bus_info.interface = RDK_IMU_I2C;
/* 指定 Accel 总线为 I2C-5，7位地址为 0x19 */
/* 指定 Gyro 总线为 I2C-5，7位地址为 0x68 */
bus_info.bus.i2c.accel.bus = 1;
bus_info.bus.i2c.accel.addr = 0x19;
bus_info.bus.i2c.gyro.bus = 1;
bus_info.bus.i2c.gyro.addr = 0x68;
rdk_imu_err_t ret = rdk_imu_bus_init(imu_st, bus_info);
if (ret != RDK_IMU_OK) return ret;
```

指定 SPI 设备初始化总线：

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_bus_info_t bus_info;
/* 指定通信方式为 SPI */
bus_info.interface = RDK_IMU_SPI;
/* 指定 Accel 为 /dev/spidev1.0，总线速度为 1MHz */
/* 指定 Gyro 为 /dev/spidev1.1，总线速度为 1MHz */
bus_info.bus.spi.accel.bus = 1;
bus_info.bus.spi.accel.cs = 0;
bus_info.bus.spi.accel.speed_hz = 1000000;
bus_info.bus.spi.gyro.bus = 1;
bus_info.bus.spi.gyro.cs = 1;
bus_info.bus.spi.gyro.speed_hz = 1000000;
rdk_imu_err_t ret = rdk_imu_bus_init(imu_st, bus_info);
if (ret != RDK_IMU_OK) return ret;
```

### 3. 配置设备属性

通过 `rdk_imu_device_init` 函数配置 IMU 的各项属性，包括：量程、带宽、采样频率、中断触发相关设置、软件 FIFO 与中断线程等。

```c
rdk_imu_err_t rdk_imu_device_init(
    rdk_imu_state_t* st,
    rdk_imu_config_t config);
```

通过 `rdk_imu_config_t` 类型结构体变量的成员选择配置：

| Member | Type | Value | Desc |
| --- | --- | --- | --- |
| accel_bwp | rdk_imu_accel_bwp_t | • RDK_IMU_OSR4<br/>• RDK_IMU_OSR2<br/>• RDK_IMU_NORMAL | <br/>• 加速度计滤波选项，具体的带宽与 ODR 共同决定，详细请参考手册<br/>• RDK_IMU_OSR4 的带宽和噪声最低，RDK_IMU_NORMAL 最高<br/>• 低噪声以响应速度为代价 |
| accel_odr | rdk_imu_accel_odr_t | • RDK_IMU_ACCEL_12_5<br/>• RDK_IMU_ACCEL_25<br/>• RDK_IMU_ACCEL_50<br/>• RDK_IMU_ACCEL_100<br/>• RDK_IMU_ACCEL_200<br/>• RDK_IMU_ACCEL_400<br/>• RDK_IMU_ACCEL_800<br/>• RDK_IMU_ACCEL_1600 | 加速度计采样频率，单位为 Hz |
| accel_range | rdk_imu_accel_range_t | • RDK_IMU_ACCEL_3G<br/>• RDK_IMU_ACCEL_6G<br/>• RDK_IMU_ACCEL_12G<br/>• RDK_IMU_ACCEL_24G | 加速度计量程，命名表示双向量程，例如 RDK_IMU_ACCEL_3G 表示 ±3 倍重力加速度 |
| gyro_range | rdk_imu_gyro_range_t | • RDK_IMU_GYRO_2000DPS<br/>• RDK_IMU_GYRO_1000DPS<br/>• RDK_IMU_GYRO_500DPS<br/>• RDK_IMU_GYRO_250DPS<br/>• RDK_IMU_GYRO_125DPS | 陀螺仪量程，命名表示双向量程，例如 RDK_IMU_GYRO_2000DPS 表示 ±2000 °/s|
| gyro_bandwidth | rdk_imu_gyro_bandwidth_t | • RDK_IMU_ODR2000_BW532<br/>• RDK_IMU_ODR2000_BW230<br/>• RDK_IMU_ODR1000_BW116<br/>• RDK_IMU_ODR400_BW47<br/>• RDK_IMU_ODR200_BW23<br/>• RDK_IMU_ODR100_BW12<br/>• RDK_IMU_ODR200_BW64<br/>• RDK_IMU_ODR100_BW32 | 陀螺仪采样频率与带宽，陀螺仪的采样频率和带宽为绑定选择 |
| accel_drdy_int | rdk_imu_accel_drdy_int_t | • RDK_IMU_INT1<br/>• RDK_IMU_INT2 | 选择 IMU 加速度计输出中断引脚 |
| accel_int_gpio_mode | rdk_imu_gpio_mode_t | • RDK_IMU_PP_H<br/>• RDK_IMU_PP_L<br/>• RDK_IMU_OD_H<br/>• RDK_IMU_OD_L | 配置 IMU 侧加速度计中断引脚电气性质：<br/>• PP 表示推挽输出<br/>• OD 表示开漏输出<br/>• H 表示高电平有效<br/>• L 表示低电平有效 |
| gyro_drdy_int | rdk_imu_gyro_drdy_int_t | • RDK_IMU_INT3<br/>• RDK_IMU_INT4 | 选择 IMU 陀螺仪输出中断引脚 |
| gyro_int_gpio_mode | rdk_imu_gpio_mode_t | • RDK_IMU_PP_H<br/>• RDK_IMU_PP_L<br/>• RDK_IMU_OD_H<br/>• RDK_IMU_OD_L | 配置 IMU 侧陀螺仪中断引脚电气性质：<br/>• PP 表示推挽输出<br/>• OD 表示开漏输出<br/>• H 表示高电平有效<br/>• L 表示低电平有效 |
| accel_drdy_gpio_chip | uint32_t | - | SoC 端接收加速度计中断的引脚 gpio chip 号 |
| accel_drdy_gpio_line | uint32_t | - | SoC 端接收加速度计中断的引脚 gpio line 号 |
| gyro_drdy_gpio_chip | uint32_t | - | SoC 端接收陀螺仪中断的引脚 gpio chip 号 |
| gyro_drdy_gpio_line | uint32_t | - | SoC 端接收陀螺仪中断的引脚 gpio line 号 |
| fifo_length | uint32_t | 2^n | 软件 FIFO 的长度，必须是 2 的整数次幂，建议至少设置为 256。 |
| fifo_mode | rdk_imu_fifo_mode_t | • RDK_IMU_FIFO_DROP<br/>• RDK_IMU_FIFO_OVERWRITE | 软件 FIFO 写入模式，当缓冲区写满时，如果该项被设为 RDK_IMU_FIFO_DROP，新数据将会被丢弃，设为 RDK_IMU_FIFO_OVERWRITE，新数据将会覆盖最旧数据|
| irq_priority | int32_t | -1 ~ 99 | 中断捕获线程的实时优先级，最高为 99（最高优先级），最低为 0，设置为 -1 表示自动搜索当前权限下可用的最高优先级，较高优先级需要 sudo 提权运行 |
| irq_thread_timeout_ns | uint64_t | - | 中断捕获线程中，循环捕获中断时间时的超时时间，单位为纳秒，设置过小会导致 CPU 负载提高，设置过大会导致关闭 IMU 的等待时间增加，建议设置为 1e9 |

实际使用中，可以不用逐个配置。`rdkimu.h` 公共头文件中准备了一些常用开发板的默认配置宏，可以使用这些宏来初始化 `rdk_imu_config_t` 结构体，然后再根据需要做更改。以下为 `RDK_IMU_X5_DEFAULT_CONFIG` 内容：

```c
#define RDK_IMU_X5_DEFAULT_CONFIG { \
    .accel_drdy_int = RDK_IMU_INT1, \
    .accel_int_gpio_mode = RDK_IMU_PP_H, \
    .accel_drdy_gpio_chip = 4, \
    .accel_drdy_gpio_line = 2, \
    .gyro_drdy_int = RDK_IMU_INT3, \
    .gyro_int_gpio_mode = RDK_IMU_PP_H, \
    .gyro_drdy_gpio_chip = 3, \
    .gyro_drdy_gpio_line = 12, \
    .irq_priority = -1, \
    .irq_thread_timeout_ns = 1000000000, \
    .accel_bwp = RDK_IMU_NORMAL, \
    .accel_range = RDK_IMU_ACCEL_24G, \
    .accel_odr = RDK_IMU_ACCEL_400, \
    .gyro_range = RDK_IMU_GYRO_2000DPS, \
    .gyro_bandwidth = RDK_IMU_ODR400_BW47, \
    .fifo_length = 256, \
    .fifo_mode = RDK_IMU_FIFO_OVERWRITE, \
}
```

以下示例如何根据默认配置宏，修改部分参数，并初始化设备：

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
/* 使用 RDK X5 模板配置 */
rdk_imu_config_t config = RDK_IMU_X5_DEFAULT_CONFIG;
/* 更改加速度计量程 */
config.accel_range = RDK_IMU_ACCEL_12G;
/* 初始化设备 */
rdk_imu_err_t ret = rdk_imu_device_init(imu_st, config);
if (ret != RDK_IMU_OK) return ret;
```

如果要更改配置，必须先关闭设备（关闭方法见下文）。

### 4. 使能数据采集

按照顺序初始化总线、初始化设备后，如果 API 的返回值均为 `RDK_IMU_OK` (0)，那么可以使用 `rdk_imu_enable` 使能数据采集。

```c
rdk_imu_err_t rdk_imu_enable(
    rdk_imu_state_t* st);
```

在 C 用户态中，若调用者不使用多线程，API 通常与调用者处于同一线程。而阻塞式的 GPIO 中断捕获以及 I2C 寄存器读写可能会导致 ODR 跳帧现象。具体而言，当中断触发 SoC 读取数据时，由于在 CPU 负载下存在延迟，系统在经过若干次 ODR 后才读取到 IMU 数据，并且会错误地将这些延后数据对应的时间戳认定为触发时的时间戳，从而导致时间戳与 IMU 帧不对应。

在内核态实现驱动可以大幅避免这个问题，因为内核的调度优先级通常高于用户态。但为了保证 SDK 的非耦合性，SDK 使用了一种较为通用的方案解决这个问题：使用软件 FIFO，创建一个高优先级的子线程，在子线程中循环捕获 GPIO 用户态中断并读取数据，同时使用 `gpiod.h` 提供的硬件触发时间戳来为 IMU 做标记，保证时间戳的精确，最后将数据带锁存入软件 FIFO 中，供 API 其他函数读取。

使能数据采集后，子线程将被创建，软件 FIFO 会开始被填充：

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_err_t ret = rdk_imu_enable(imu_st);
if (ret != RDK_IMU_OK) return ret;
```

`rdk_imu_enable` 函数是线程安全的。`rdk_imu_enable` 保证在被 `rdk_imu_disable` 之前，只有一方成功使能并接收到返回值 `RDK_IMU_OK` (0)，重复使能方会接收到返回值 `RDK_IMU_DEVICE_BUSY`。

### 5. 读取 IMU 数据

目前（v1.0.0 版本），API 提供了 3 个函数可用于 IMU 数据的读取：

- 缓冲区余量读取：

```c
rdk_imu_err_t rdk_imu_fifo_available(
    rdk_imu_state_t *st,
    uint32_t *count);
```

- 独立数据包读取：

```c
rdk_imu_err_t rdk_imu_read_indep(
    rdk_imu_state_t *st,
    rdk_imu_6_axis_data_t *data,
    uint32_t *count);
```

- 融合数据包读取：

```c
rdk_imu_err_t rdk_imu_read_fused(
    rdk_imu_state_t *st,
    rdk_imu_6_axis_data_t *data,
    rdk_imu_device_t fuse_by,
    uint64_t max_age_ns);
```

这些函数都是线程安全的。

下面说明独立数据包读取和融合数据包读取的区别：

对于 BMI088 IMU，加速度计和陀螺仪在电气属性、通信地址、物理隔离、时钟分频和数据相关性上，都表现为 2 个无关的设备，仅仅是物理位置绑定了。加速度计和陀螺仪分别使用两路不同的中断，设置为相同 ODR 值时，加速度计和陀螺仪也不会同时发生 ODR，这就导致实际无法向 BMI088 读取到时间戳同步的 6 轴数据，只能读取到两组时间戳对齐的 3 轴数据，它们被缓存在同一个 FIFO 中。

`rdk_imu_read_indep` 函数读出的数据为原始数据包，`*count` 为读取之后的剩余 FIFO 数据余量。在输出的 `data->accel` 和 `data->gyro` 这两组 3 轴数据中，只有一组数据是有效的，可以通过 `data.accel.valid` 和 `data.gyro.valid` 判断：

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_6_axis_data_t data;
uint32_t count;
/* 读取独立数据包 */
rdk_imu_err_t ret = rdk_imu_read_indep(imu_st, &data, &count);
if (ret != RDK_IMU_OK) return ret;
if (data.accel.valid && !data.gyro.valid) {
    /* 加速度数据包有效 */
} else if (!data.accel.valid && data.gyro.valid) {
    /* 角速度数据包有效 */
} else {
    /* 不存在 */
}
```

用户可以多次读取该数据，并对这些数据进行插值融合，以在某个时间戳下合并 6 轴数据。

`rdk_imu_read_fused` 是一个简单的一维线性插值方法。为了保证时间戳间隔的一致性，需要用 `fuse_by` 参数指定加速度计或陀螺仪的某一边为真值，固定读出这一侧的数据，另外一侧的数据则通过 `fuse_by` 一侧的时间戳插值获取，读出的融合数据频率为加速计和陀螺仪采样频率的最低值。  
`fuse_by` 为 `rdk_imu_device_t` 类型，可指定为 `RDK_IMU_ACCEL` 或 `RDK_IMU_GYRO`。  
`max_age_ns` 表示插值可接受的时间间隔，如果插值窗口中参与插值的数据时间最大间隔大于该值，本次插值将会失败，函数将阻塞，直到有成功的插值输出，建议设置为 ODR 周期的 3 倍以上。

下面展示指定加速度为真值，读取插值融合的 6 轴数据包的示例：

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_6_axis_data_t data;
/* 读取融合数据包，最大允许插值间隔为 50ms */
rdk_imu_err_t ret = rdk_imu_read_fused(imu_st, &data, RDK_IMU_ACCEL, 5e7);
if (ret != RDK_IMU_OK) return ret;
```

`rdk_imu_6_axis_data_t` 类型实现如下：

```c
typedef struct {
    float x, y, z;
    uint64_t timestamp_ns;
    int32_t valid;
} rdk_imu_3_axis_data_t;

typedef struct {
    rdk_imu_3_axis_data_t accel, gyro;
} rdk_imu_6_axis_data_t;
```

其中：

- `x`、`y`、`z`：表示处理后的三轴数据，对于加速度计单位为 m/s²，对于陀螺仪单位为 °/s。
- `timestamp_ns`：IMU 数据采样时刻的 SoC 系统时间戳，单位为纳秒，当前版本（v1.0.0）中的时钟源默认为 `gpiod.h` 库提供的 `CLOCK_MONOTONIC`。
- `valid`：表示以上数据是否有效，0 表示有效，其他值表示无效。

### 6. 关闭数据采集

使用 `rdk_imu_disable` 函数以关闭中断捕获线程，停止 FIFO 填充。

```c
rdk_imu_err_t rdk_imu_disable(
    rdk_imu_state_t* st);
```

### 7. 关闭设备

使用 `rdk_imu_device_deinit` 函数对 IMU 设备进行反初始化，关闭设备。

```c
rdk_imu_err_t rdk_imu_device_deinit(
    rdk_imu_state_t* st);
```

### 8. 关闭总线

使用 `rdk_imu_bus_deinit` 函数对 IMU 设备的总线进行反初始化，释放总线设备。

```c
rdk_imu_err_t rdk_imu_bus_deinit(
    rdk_imu_state_t* st);
```

### 9. 销毁句柄

使用 `rdk_imu_destroy` 函数以安全地销毁 IMU 句柄。

```c
rdk_imu_err_t rdk_imu_destroy(
    rdk_imu_state_t *st);
```

## 二次开发方式

为了防止调用方的误操作，SDK 将公共 API 头文件和私有头文件进行了分类。进行构建后，私有头文件的内容将被构建的动态库和静态库包含，此后私有头文件将不再被需要。

在自己的项目文件构建时，需要保证 `rdkimu.h` 头文件在项目环境的 Include 路径中，使用 `-lrdkimu` 正确链接 `librdkimu`，且 LIB 路径下包含 `libgpiod.so.2.x.x` 这个依赖。

拷贝 `core/lib` 下的动态库时，使用 `cp -a` 保持链接属性，或者直接使用本项目 Makefile 提供的 `make install` 来安装与卸载库。
