from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from db import get_table_names

app = FastAPI()
origins = [
    "https://v2.urban-codesign.com",
    "http://localhost",
    "http://localhost:8080"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
async def root():
    try: 
        table_names = get_table_names()
        if table_names:
            result = []
            for table in table_names:
                d = dict()
                d['id'] = table_names.index(table)
                d['name'] = table[0]
                result.append(d)
            subjects = json.dumps(result)
            return json.loads(subjects)
    except BaseException as err:
        print(f"Unexpected {err=}, {type(err)=}")
        raise HTTPException(status_code=500, detail=f"Something went wrong: {err}")
    
    
