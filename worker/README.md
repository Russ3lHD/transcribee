# transcribee-worker

a transcription worker for the transcribee open-source transcription platform

This component connects to the backend, picks up jobs and runs transcription / forced-alignment / speaker-identification jobs.
It thus does all the CPU / GPU intense heavy lifting.

## Installation

We use uv for dependency management. To install all dependencies locally, run:

```shell
uv sync --dev
```

## Configuration

You can configure the worker by setting environment variables.
For a full list of those, see the attributes of the `Settings` class in `config.py`
Instead of setting environment variables, you can also specify them in the `.env`-file.
They will automatically be read from there.
See .env.example for an example of how this file could look.

The most important settings are explained here:

The worker needs multiple models, which will automatically be downloaded if they to not exist yet.
They will by default be stored in `./.data/models`.
You can change this directory by setting `MODELS_DIR`
