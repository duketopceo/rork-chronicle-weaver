import subprocess
import sys
import time
import os
import urllib.request
import socket

def print_header(msg):
    print(f"\n{'='*50}")
    print(f" {msg}")
    print(f"{'='*50}")

def run_command(command, cwd=None, shell=True):
    print(f"Running: {command}")
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=shell,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        print("✅ Success")
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        print("❌ Failed")
        print(f"Error: {e.stderr}")
        return False, e.stderr

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def test_web_server():
    print_header("Testing Web Server Loading")
    
    # Start the server in the background
    print("Starting web server...")
    
    try:
        server_process = subprocess.Popen(
            ["npm", "run", "start-web"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
            cwd=os.getcwd()
        )
        
        # Wait for server to start (poll for port)
        max_retries = 30
        port = 8081
        server_ready = False
        
        for i in range(max_retries):
            if check_port(port):
                server_ready = True
                break
            time.sleep(1)
            print(f"Waiting for server... ({i+1}/{max_retries})")
            
        if not server_ready:
            print("❌ Server failed to start on port 8081")
            # Try to kill it
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(server_process.pid)])
            return False

        print("Server is listening on port 8081")
        
        # Check if the root page loads
        try:
            with urllib.request.urlopen(f"http://localhost:{port}") as response:
                if response.status == 200:
                    print("✅ Web root loads successfully (HTTP 200)")
                    content = response.read().decode('utf-8')
                    # Check for critical content
                    if "<div id=\"root\">" in content or "<body>" in content:
                         print("✅ HTML content looks valid")
                    else:
                         print("⚠️ HTML content might be empty")
                else:
                    print(f"❌ Web root returned HTTP {response.status}")
        except Exception as e:
            print(f"❌ Failed to connect to web server: {e}")
            
    finally:
        # Cleanup
        print("Stopping web server...")
        if 'server_process' in locals():
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(server_process.pid)])

def main():
    print_header("Chronicle Weaver - Full App Test Suite")
    
    # 1. Environment Check
    print_header("Environment Check")
    run_command("node --version")
    run_command("npm --version")
    
    # 2. Static Analysis
    print_header("Static Analysis")
    success, _ = run_command("npx tsc --noEmit")
    if not success:
        print("⚠️ TypeScript errors detected (continuing...)")
        
    # 3. Unit Tests
    print_header("Unit Tests")
    # Run tests but don't fail the whole script if they fail, just report
    run_command("npm test -- --passWithNoTests")
    
    # 4. Build Test
    print_header("Production Build Test")
    build_success, _ = run_command("npm run build:production")
    
    if build_success:
        print("✅ Production build completed successfully")
    else:
        print("❌ Production build failed")
        # We might stop here if build fails, but let's try to run the dev server anyway to see if it works in dev mode
        
    # 5. Runtime Test (Web)
    test_web_server()
    
    print_header("Test Suite Completed")

if __name__ == "__main__":
    main()
