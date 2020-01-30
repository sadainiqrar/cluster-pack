# box-circle-packer

Circle Packing Alogrithm to pack Random Sized Circles in a Rectangle

Huge Credits to https://stackexchange.com/users/3544517/kuroi-neko for coding this Algorithm

## Packer

```js
import pack from 'box-circle-packer'

const width = window.innerWidth;
const height = window.innerHeight
const circles = 100
const min_r = 20;
const max_r = 80;
const radiuses = []
for (let i = 0; i !== circles; i++)
    radiuses.push(Math.random() * (max_r - min_r) + min_r);
const list = pack(radiuses, width, height)
```
![packer](https://user-images.githubusercontent.com/15946354/73442783-4241d000-4377-11ea-8653-5539988d1839.PNG)


## Installation

```sh
npm install box-circle-packer
```

## Usage

**Using NPM**

1 . Require box-circle-packer after installation

```js
import pack from 'box-circle-packer'
```

2 . Call pack with required Arguments

```js
const packedCircles = pack(radiuses, width, height, spacingFactor)
```

## Options

| Arguments      | Type     | Description       | Default Value    |
| :--------- | :------- | :---------------- | :--------------- |
| radiuses | Number[] | Array of circles Radius | [] |
| width | Number | Width of Box | 0 |
| height | Number | Height of Box | 0 |
| spacingFactor | Number | Spacing Between Circles | 0 |


## Contributing

We welcome your contribution! Fork the repo, make some changes, submit a pull-request!.

## License

none