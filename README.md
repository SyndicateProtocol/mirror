# 🪞 Mirror 🪞
![mirror](public/mirror.svg)

Mirror allows you to listen to offchain events or poll offchain resources & _mirror_ that data to other chains


# Get Started

### Broadcasting Transactions
We use the [Transaction Cloud](https://docs.syndicate.io/infrastructure/transaction-broadcasting) to broadcast data to target chains. Sign up [here](https://dashboard.syndicate.io/signup) for a free account.


### Install Bun
https://bun.sh/docs/installation

### Install Dependencies
`bun i`

### Run it
`bun dev`

### Deploy it
Currently we run this service in Cloud Run with min instances set to 1 so the service will never spin down. The code is unopinionated and does not use external resources such as a database or a memcache & is easy to deploy to other cloud providers such as [Render](https://render.com/), [fly.io](https://fly.io/), [Heroku](https://id.heroku.com/login), etc. The main thing to keep in mind is you want this service to always be on so you are always listening for data.
