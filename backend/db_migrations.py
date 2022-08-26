from yoyo import get_backend, read_migrations

from db import dbConfig

backend = get_backend(f"postgresql://{dbConfig['user']}:{dbConfig['password']}@{dbConfig['host']}:{dbConfig['port']}/{dbConfig['dbname']}")
migrations = read_migrations('./db_migrations')


def run_database_migrations()->None:
    print("Running database migrations...")
    with backend.lock():
        # Apply any outstanding migrations
        backend.apply_migrations(backend.to_apply(migrations))

        # Rollback all migrations
        backend.rollback_migrations(backend.to_rollback(migrations))


if __name__ == "__main__":
    run_database_migrations()
