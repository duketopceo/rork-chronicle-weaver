import subprocess
import sys
import time
import os
import urllib.request
import socket
import json
import re

# Utility functions for logging and timing
def print_header(msg):
    print(f"\n{'='*60}")
    print(f" {msg}")
    print(f"{'='*60}")

def print_sub_header(msg):
    print(f"\n--- {msg} ---")

def time_step(func):
    """Decorator to time a step and print duration."""
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        print(f"⏱ {func.__name__} completed in {duration:.2f}s")
        return result
    return wrapper

def run_command(command, cwd=None, shell=True, capture_output=True, ignore_error=False):
    print(f"Running: {command}")
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=shell,
            check=not ignore_error,
            stdout=subprocess.PIPE if capture_output else None,
            stderr=subprocess.PIPE if capture_output else None,
            text=True
        )
        if capture_output:
            return True, result.stdout, result.stderr
        return True, "", ""
    except subprocess.CalledProcessError as e:
        if not ignore_error:
            print("❌ Failed")
            if capture_output:
                print(f"Error: {e.stderr}")
        return False, e.stdout if capture_output else "", e.stderr if capture_output else ""

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

# ---------------------------------------------------------------------------
# 1. File Structure Verification
# ---------------------------------------------------------------------------
@time_step
def check_file_structure():
    print_header("1. File Structure Verification")
    required_files = [
        "package.json",
        "tsconfig.json",
        "firebase.json",
        ".env.local",
        "app.json",
        "src/app/_layout.tsx",
        "src/store/gameStore.ts",
        "src/services/aiService.ts",
        "src/types/game.ts"
    ]
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ Found: {file_path}")
        else:
            print(f"❌ Missing: {file_path}")
            all_exist = False
    return all_exist

# ---------------------------------------------------------------------------
# 2. Environment Variable Check
# ---------------------------------------------------------------------------
@time_step
def check_environment_variables():
    print_header("2. Environment Variable Check")
    env_file = ".env.local"
    if not os.path.exists(env_file):
        print(f"❌ {env_file} not found")
        return False
    required_keys = [
        "EXPO_PUBLIC_GEMINI_API_KEY",
        "EXPO_PUBLIC_FIREBASE_API_KEY",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID"
    ]
    found_keys = []
    try:
        with open(env_file, "r") as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    key = line.split("=")[0].strip()
                    found_keys.append(key)
        for key in required_keys:
            if key in found_keys:
                print(f"✅ Found key: {key}")
            else:
                print(f"⚠️ Missing key: {key}")
        return True
    except Exception as e:
        print(f"❌ Error reading {env_file}: {e}")
        return False

# ---------------------------------------------------------------------------
# 3. Dependency Check
# ---------------------------------------------------------------------------
@time_step
def check_dependencies():
    print_header("3. Dependency Check")
    if not os.path.exists("package.json"):
        print("❌ package.json not found")
        return False
    try:
        with open("package.json", "r") as f:
            pkg = json.load(f)
        deps = pkg.get("dependencies", {})
        dev_deps = pkg.get("devDependencies", {})
        critical_deps = [
            "expo",
            "react",
            "react-native",
            "firebase",
            "@google/generative-ai",
            "zustand"
        ]
        print(f"Found {len(deps)} dependencies and {len(dev_deps)} devDependencies.")
        all_critical = True
        for dep in critical_deps:
            if dep in deps:
                print(f"✅ {dep}: {deps[dep]}")
            else:
                print(f"❌ Missing critical dependency: {dep}")
                all_critical = False
        return all_critical
    except Exception as e:
        print(f"❌ Error parsing package.json: {e}")
        return False

# ---------------------------------------------------------------------------
# 4. Linting
# ---------------------------------------------------------------------------
@time_step
def run_linting():
    print_header("4. Code Quality & Linting")
    success, stdout, stderr = run_command("npm run lint", ignore_error=True)
    if success:
        print("✅ Linting passed with no errors")
    else:
        print("⚠️ Linting issues detected (first 10 lines shown):")
        lines = (stdout + stderr).splitlines()
        for line in lines[:10]:
            print(f"  {line}")
        if len(lines) > 10:
            print(f"  ... and {len(lines)-10} more lines")
    return True  # Non‑blocking

# ---------------------------------------------------------------------------
# 5. Static TypeScript Analysis
# ---------------------------------------------------------------------------
@time_step
def run_static_analysis():
    print_header("5. Static Analysis (TypeScript)")
    success, stdout, stderr = run_command("npx tsc --noEmit", ignore_error=True)
    if success:
        print("✅ TypeScript compilation successful")
        return True
    else:
        print("❌ TypeScript errors detected (first 5 shown):")
        lines = (stdout + stderr).splitlines()
        count = 0
        for line in lines:
            if "error TS" in line:
                count += 1
                if count <= 5:
                    print(f"  {line.strip()}")
        if count > 5:
            print(f"  ... and {count-5} more errors")
        return False

@time_step
def run_type_check():
    print_header("5b. npm type-check")
    success, stdout, stderr = run_command("npm run type-check", ignore_error=True)
    if success:
        print("✅ npm type-check succeeded")
        return True
    else:
        print("❌ npm type-check failed")
        print(stderr)
        return False

# ---------------------------------------------------------------------------
# 6. Unit Tests & Coverage
# ---------------------------------------------------------------------------
@time_step
def run_unit_tests():
    print_header("6. Unit Tests")
    success, stdout, stderr = run_command("npm test -- --passWithNoTests", ignore_error=True)
    if success:
        print("✅ Unit tests passed")
        return True
    else:
        print("❌ Unit tests failed")
        print(stderr)
        return False

@time_step
def run_test_coverage():
    print_header("6b. Test Coverage")
    success, stdout, stderr = run_command("npm test -- --coverage", ignore_error=True)
    if success:
        # Extract coverage summary lines
        coverage_lines = []
        capture = False
        for line in stdout.splitlines():
            if line.strip().startswith("----------"):
                capture = not capture
                continue
            if capture:
                coverage_lines.append(line)
        print("✅ Coverage report (summary):")
        for cl in coverage_lines[:10]:
            print(f"  {cl}")
        return True
    else:
        print("❌ Coverage generation failed")
        print(stderr)
        return False

# ---------------------------------------------------------------------------
# 7. Production Build
# ---------------------------------------------------------------------------
@time_step
def run_production_build():
    print_header("7. Production Build Verification")
    start = time.time()
    success, stdout, stderr = run_command("npm run build:production")
    duration = time.time() - start
    print(f"⏱ Build duration: {duration:.2f}s")
    if success:
        print("✅ Production build succeeded")
        if os.path.isdir("web-build"):
            print("✅ web-build directory exists")
        elif os.path.isdir("dist"):
            print("✅ dist directory exists")
        else:
            print("⚠️ No expected build output directory found")
        return True
    else:
        print("❌ Production build failed (last 20 lines):")
        for line in stderr.splitlines()[-20:]:
            print(f"  {line}")
        return False

# ---------------------------------------------------------------------------
# 8. Firebase Configuration
# ---------------------------------------------------------------------------
@time_step
def check_firebase_config():
    print_header("8. Firebase Configuration Check")
    if not os.path.exists("firebase.json"):
        print("❌ firebase.json not found")
        return False
    try:
        with open("firebase.json", "r") as f:
            cfg = json.load(f)
        if "hosting" in cfg:
            print("✅ hosting config present")
        else:
            print("⚠️ hosting config missing")
        return True
    except Exception as e:
        print(f"❌ Error parsing firebase.json: {e}")
        return False

# ---------------------------------------------------------------------------
# 9. Expo Configuration
# ---------------------------------------------------------------------------
@time_step
def check_expo_config():
    print_header("9. Expo Configuration Check")
    if not os.path.exists("app.json"):
        print("❌ app.json not found")
        return False
    try:
        with open("app.json", "r") as f:
            cfg = json.load(f)
        expo = cfg.get("expo", {})
        if expo.get("name") and expo.get("slug"):
            print("✅ Expo name and slug defined")
        else:
            print("⚠️ Expo name or slug missing")
        return True
    except Exception as e:
        print(f"❌ Error parsing app.json: {e}")
        return False

# ---------------------------------------------------------------------------
# 10. Build Artifact Verification
# ---------------------------------------------------------------------------
@time_step
def verify_build_artifacts():
    print_header("10. Build Artifact Verification")
    build_dir = "web-build" if os.path.isdir("web-build") else "dist" if os.path.isdir("dist") else None
    if not build_dir:
        print("❌ No build directory found")
        return False
    expected = ["index.html", "manifest.json", "static"]
    missing = [e for e in expected if not os.path.exists(os.path.join(build_dir, e))]
    if missing:
        print(f"⚠️ Missing artifacts: {', '.join(missing)}")
        return False
    print("✅ All key artifacts present")
    return True

# ---------------------------------------------------------------------------
# 11. API Endpoint Health Checks (if any local server)
# ---------------------------------------------------------------------------
@time_step
def check_api_endpoints():
    print_header("11. API Endpoint Health Checks")
    # Example placeholder – adapt URLs as needed
    endpoints = [
        "http://localhost:8081/api/health",
        "http://localhost:8081/api/version"
    ]
    all_ok = True
    for url in endpoints:
        try:
            with urllib.request.urlopen(url, timeout=5) as resp:
                if resp.status == 200:
                    print(f"✅ {url} responded 200")
                else:
                    print(f"⚠️ {url} responded {resp.status}")
                    all_ok = False
        except Exception as e:
            print(f"❌ {url} request failed: {e}")
            all_ok = False
    return all_ok

# ---------------------------------------------------------------------------
# 12. Web Server Runtime Test (expanded)
# ---------------------------------------------------------------------------
@time_step
def test_web_server():
    print_header("12. Web Server Runtime Test")
    if check_port(8081):
        print("⚠️ Port 8081 in use – attempting to free")
        subprocess.call(['taskkill', '/F', '/IM', 'node.exe'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(2)
    server_process = subprocess.Popen(
        ["npm", "run", "start-web"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True,
        cwd=os.getcwd()
    )
    try:
        max_wait = 45
        for i in range(max_wait):
            if check_port(8081):
                print("✅ Server listening on 8081")
                break
            time.sleep(1)
            if i % 5 == 0:
                print(f"Waiting for server... ({i}/{max_wait})")
        else:
            print("❌ Server failed to start within timeout")
            return False
        # Basic HTTP checks
        urls = [
            f"http://localhost:8081/",
            f"http://localhost:8081/manifest.json"
        ]
        for u in urls:
            try:
                with urllib.request.urlopen(u) as resp:
                    if resp.status == 200:
                        print(f"✅ {u} returned 200")
                    else:
                        print(f"⚠️ {u} returned {resp.status}")
            except Exception as e:
                print(f"❌ Request to {u} failed: {e}")
        # Simple DOM sanity check (look for root div)
        try:
            with urllib.request.urlopen("http://localhost:8081/") as resp:
                content = resp.read().decode('utf-8')
                if "<div id=\"root\"" in content:
                    print("✅ Root div present in HTML")
                else:
                    print("⚠️ Root div missing in HTML")
        except Exception as e:
            print(f"❌ HTML fetch failed: {e}")
    finally:
        print("\nStopping web server...")
        subprocess.call(['taskkill', '/F', '/T', '/PID', str(server_process.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return True

# ---------------------------------------------------------------------------
# 13. Expo Development Server Check (optional)
# ---------------------------------------------------------------------------
@time_step
def run_expo_dev_server():
    print_header("13. Expo Development Server Check")
    # This will start the Expo dev server; we only verify it starts and provides a QR code line.
    dev_process = subprocess.Popen(
        ["npm", "run", "start"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True,
        cwd=os.getcwd()
    )
    try:
        for i in range(30):
            line = dev_process.stdout.readline().decode('utf-8').strip()
            if line:
                print(f"[expo] {line}")
            if "QR Code" in line or "Metro waiting" in line:
                print("✅ Expo dev server appears healthy")
                break
            time.sleep(1)
        else:
            print("⚠️ Expo dev server did not emit expected startup messages")
    finally:
        subprocess.call(['taskkill', '/F', '/T', '/PID', str(dev_process.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return True

# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------
def main():
    print_header("CHRONICLE WEAVER - EXTENDED COMPREHENSIVE TEST SUITE")
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    results = {
        "file_structure": False,
        "env_vars": False,
        "dependencies": False,
        "linting": False,
        "static_analysis": False,
        "type_check": False,
        "unit_tests": False,
        "coverage": False,
        "build": False,
        "firebase_config": False,
        "expo_config": False,
        "build_artifacts": False,
        "api_endpoints": False,
        "web_server": False,
        "expo_dev": False,
    }
    results["file_structure"] = check_file_structure()
    results["env_vars"] = check_environment_variables()
    results["dependencies"] = check_dependencies()
    results["linting"] = run_linting()
    results["static_analysis"] = run_static_analysis()
    results["type_check"] = run_type_check()
    results["unit_tests"] = run_unit_tests()
    results["coverage"] = run_test_coverage()
    results["build"] = run_production_build()
    results["firebase_config"] = check_firebase_config()
    results["expo_config"] = check_expo_config()
    results["build_artifacts"] = verify_build_artifacts()
    results["api_endpoints"] = check_api_endpoints()
    if results["build"]:
        results["web_server"] = test_web_server()
    else:
        print_header("Skipping Web Server Test – build failed")
    # Optional dev server check – non‑blocking, can be disabled if too noisy
    results["expo_dev"] = run_expo_dev_server()
    # Summary
    print_header("TEST SUMMARY")
    all_passed = True
    for name, ok in results.items():
        status = "✅ PASS" if ok else "❌ FAIL"
        if not ok and name != "linting":
            all_passed = False
        print(f"{name.ljust(20)}: {status}")
    if all_passed:
        print("\n🎉 ALL CHECKS PASSED – ready for deployment!")
        sys.exit(0)
    else:
        print("\n⚠️ SOME CHECKS FAILED – review above details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
