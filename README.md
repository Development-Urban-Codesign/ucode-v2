# ucode-v2
[![ucode ci/cd pipeline](https://github.com/Development-Urban-Codesign/ucode-v2/actions/workflows/ci_cd.yml/badge.svg)](https://github.com/Development-Urban-Codesign/ucode-v2/actions/workflows/ci_cd.yml)


## Deployment
Currently the application stack is being deployed on a virtual machine running on the [IONOS cloud](https://cloud.ionos.de/). A local GitHub actions runner is installed on the VM which (re)-deploys the stack on every commit to the *master*-branch.

The application stack runs from a [docker compose stack](./docker-compose.yml).

## Operations/Manual monitoring
Some useful commands in order to debug and or monitor the running state of the application containers:

```
# Navigate into the working directory where the docker-compose.yml file is located
cd /opt/github-runner/_work/ucode-v2/ucode-v2

# List running compose projects
docker compose ls

# View log output from all containers within the composition
docker compose logs -f

# Restart containers
docker compose restart

# Display the running processes in the containers
docker compose top

# List images used by the created containers
docker compose images

# List currently running containers
docker compose ps

# Stop running containers
docker compose down


# (Re)build containers
docker compose build

# Start newly built containers in detached mode
docker compose up --detach
```