This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Carpark Availabilities App

A real-time map visualization of all carparks in Singapore.

## Getting Started

Access the app [here](https://sg-carpark-availabilities.vercel.app/).

## Features

- **Search for a carpark** by typing in some keyword into the search bar.
- **Get all carparks near to your location** by clicking on _nearby carparks_.
- **Pan and zoom into a specific carpark** by clicking on the name of the carpark in the list.
- **Interpreting the carpark availabilities**
  - `c: 4` => Car lots available
  - `h: 10` => Heavy vehicle lots available
  - `y: 2` => Motorcycle lots available

## Technologies used

- Built using [Next.js](https://nextjs.org/), a [React.js](https://reactjs.org/) framework.
- Designed using [MaterialUI](https://mui.com/), a [React.js](https://reactjs.org) UI library.
- Used `Typescript` and `SCSS` in this project.
- Carpark data are fetched from [LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html#Traffic), [URA Carpark API](https://www.ura.gov.sg/maps/api/) and [HDB Carpark API](https://data.gov.sg/dataset/hdb-carpark-information).
- Uses [Google Sheet Developer API](https://developers.google.com/sheets/api) to store static carpark data.
  - The above APIs can take quite long to fetch, especially static data such as carpark information.
  - This reduces the load-time of static carpark data (from 10-15 seconds, down to 1.6 seconds).

## About the developer

I am Ezekiel, an NUS Computer Science undergraduate expecting to graduate in 2024. I enjoy spending my time ideating and creating small projects.

If you like or have any suggestions about my work, please feel free to contact me at ezekiel@comp.nus.edu.sg.
