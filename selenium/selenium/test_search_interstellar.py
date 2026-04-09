import os
from datetime import datetime

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BASE_URL = os.getenv("E2E_BASE_URL", "http://localhost:5174")
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")


@pytest.fixture
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")

    driver_instance = webdriver.Chrome(options=chrome_options)
    driver_instance.implicitly_wait(2)
    yield driver_instance
    driver_instance.quit()


def take_screenshot(driver: webdriver.Chrome, name: str) -> str:
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.join(SCREENSHOT_DIR, f"{name}_{timestamp}.png")
    driver.save_screenshot(path)
    return path


def test_search_interstellar_from_search_page(driver):
    driver.get(f"{BASE_URL}/#/kereses")

    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("#/kereses"))
    search_input = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input.search-input"))
    )

    search_input.clear()
    search_input.send_keys("Interstellar")

    interstellar_title = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//h5[contains(@class, 'card-title') and normalize-space()='Interstellar']"))
    )
    assert interstellar_title.is_displayed()

    screenshot_path = take_screenshot(driver, "search_interstellar")
    assert os.path.exists(screenshot_path)


def test_search_page_navigation_and_empty_result(driver):
    driver.get(f"{BASE_URL}/#/kereses")

    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("#/kereses"))

    search_input = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input.search-input"))
    )
    search_input.clear()
    search_input.send_keys("nincs-ilyen-tartalom-123")

    empty_title = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'empty-title') and contains(., 'Nincsenek találatok')]"))
    )
    assert empty_title.is_displayed()

    screenshot_path = take_screenshot(driver, "search_empty_result")
    assert os.path.exists(screenshot_path)
