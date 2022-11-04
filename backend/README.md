### Ucode backend

#### Dev setup

##### Mac OS

Install postgresql via brew because _psycopg_ needs it as a dependency:
`brew install postgresql`

Install version python version 3.11:
`brew install python@3.11`

##### Linux

Install postgresql via brew because _psycopg_ needs it as a dependency:
`sudo apt install postgresql`

Create a [python virtual environment](https://docs.python.org/3/library/venv.html) in order to avoid version collision of third party libraries:
`make init`

Activate the virtual environment:
`source .venv/bin/activate`

If you later on want to deactivate the virtual environment, just execute `deactivate`.

Install dependencies:
`make install-dev`

Run tests:
Install dependencies:
`make test`

Run the application locally:
`make run`
