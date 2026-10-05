import logging
import os

from py_eureka_client import eureka_client

APP_NAME = "NOTIFICATION"
EUREKA_SERVER = os.getenv("EUREKA_SERVER", "http://localhost:8761/eureka")
INSTANCE_HOST = os.getenv("INSTANCE_HOST", "localhost")
INSTANCE_IP = os.getenv("INSTANCE_IP", "127.0.0.1")
INSTANCE_NAME = os.getenv("INSTANCE_NAME", "Amine")

logger = logging.getLogger("uvicorn.error")


async def start_eureka(port: int) -> None:
    base_url = f"http://{INSTANCE_HOST}:{port}"
    try:
        await eureka_client.init_async(
            eureka_server=EUREKA_SERVER,
            app_name=APP_NAME,
            instance_id=f"{INSTANCE_NAME}:notification:{port}",
            instance_host=INSTANCE_HOST,
            instance_ip=INSTANCE_IP,
            instance_port=port,
            vip_adr="notification",
            home_page_url=f"{base_url}/",
            status_page_url=f"{base_url}/health",
            health_check_url=f"{base_url}/health",
        )
        logger.info("%s registered in Eureka (%s) on port %s", APP_NAME, EUREKA_SERVER, port)
    except Exception as error:
        logger.error("Eureka registration failed: %s", error)


async def stop_eureka() -> None:
    if eureka_client.get_client() is None:
        return
    try:
        await eureka_client.stop_async()
        logger.info("%s deregistered from Eureka", APP_NAME)
    except Exception as error:
        logger.error("Eureka deregistration failed: %s", error)
