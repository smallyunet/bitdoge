import multiprocessing
import time
import os
from Crypto.Hash import keccak

# ================= CONFIGURATION =================

# Target Prefix (without '0x')
# Recommendations:
# "bd09e"   (5 chars) -> Minutes on CPU
# "bd09e2"  (6 chars) -> Hours on CPU
# "bd09e21" (7 chars) -> Days on CPU (Not recommended without GPU)
TARGET = "00000000"

# Immutable Create2 Factory Address (Standard)
FACTORY = bytes.fromhex("0000000000FFe8B47B3e2130213B802212439497")

# Your Contract InitCodeHash (Extracted from your previous logs)
INIT_CODE_HASH = bytes.fromhex("e6c6b86eb9e8eb086720c3cea2ae886edd5215231f3069c78b7afb7485467533")

# =================================================

# Global event to signal all processes to stop when found
stop_event = multiprocessing.Event()

def worker(core_id, step, start_nonce):
    """
    Worker process: Calculates hashes in a loop.
    """
    # Pre-calculate the fixed part of Create2: 0xff + factory
    # Formula: keccak256( 0xff ++ factory ++ salt ++ init_code_hash )
    prefix_data = b'\xff' + FACTORY
    
    # Each core starts at a different nonce and increments by 'step' (total cores)
    # This prevents overlap between cores.
    nonce = start_nonce
    
    # Optimization: Convert target to bytes for faster comparison if length is even
    target_bytes = None
    if len(TARGET) % 2 == 0:
        try:
            target_bytes = bytes.fromhex(TARGET)
        except:
            pass
            
    # Local variable caching for speed
    k_new = keccak.new
    
    print(f"[*] Core {core_id} started...")
    
    while not stop_event.is_set():
        # Convert nonce to 32-byte salt (Big Endian)
        salt = nonce.to_bytes(32, 'big')
        
        # Concatenate data
        pre_image = prefix_data + salt + INIT_CODE_HASH
        
        # Calculate Keccak-256
        k = k_new(digest_bits=256)
        k.update(pre_image)
        digest = k.digest()
        
        # The address is the last 20 bytes of the hash
        # We only need to check the beginning.
        
        # Fast Check Mode (For even length targets, e.g., "bd09e2")
        if target_bytes:
            # Direct byte comparison is faster
            if digest[12:12+len(target_bytes)] == target_bytes:
                return nonce, digest[12:].hex(), salt.hex()
        else:
            # String Check Mode (For odd length targets, e.g., "bd09e")
            # Slightly slower but works for any length
            addr_hex = digest[12:].hex()
            if addr_hex.startswith(TARGET):
                return nonce, addr_hex, salt.hex()
        
        # Increment nonce by the number of cores
        nonce += step
        
        # Progress report (Only Core 0 prints this)
        if core_id == 0 and nonce % 200000 == 0:
            print(f"[-] Mining... Current Nonce: {nonce}", end='\r')

    return None

def main():
    # Detect CPU cores
    num_cores = multiprocessing.cpu_count()
    print(f"\n[+] Detected {num_cores} CPU cores.")
    print(f"[+] Target Prefix: 0x{TARGET}...")
    print(f"[+] InitCodeHash:  0x{INIT_CODE_HASH.hex()}")
    print("[+] Starting engines... (Press Ctrl+C to stop)\n")
    
    pool = multiprocessing.Pool(processes=num_cores)
    results = []
    
    start_time = time.time()
    
    # Start worker processes
    for i in range(num_cores):
        # Args: (Core ID, Step Size, Start Nonce)
        res = pool.apply_async(worker, args=(i, num_cores, i))
        results.append(res)
    
    pool.close()
    
    try:
        found = False
        while not found:
            # Check results periodically
            for res in results:
                if res.ready():
                    result = res.get()
                    if result:
                        nonce, addr, salt_hex = result
                        stop_event.set()
                        pool.terminate()
                        
                        end_time = time.time()
                        print("\n\n" + "="*60)
                        print("🚀 🚀 🚀  FOUND IT !!!  🚀 🚀 🚀")
                        print("="*60)
                        print(f"Address:      0x{addr}")
                        print(f"Salt (Hex):   0x{salt_hex}")
                        print(f"Time used:    {end_time - start_time:.2f} seconds")
                        print("="*60)
                        
                        print("\n👇 COPY THE COMMAND BELOW TO DEPLOY 👇\n")
                        cmd = (
                            f"cast create2 "
                            f"--rpc-url <YOUR_RPC_URL> "
                            f"--private-key <YOUR_PRIVATE_KEY> "
                            f"--factory 0x{FACTORY.hex()} "
                            f"--init-code-hash 0x{INIT_CODE_HASH.hex()} "
                            f"--salt 0x{salt_hex}"
                        )
                        print(cmd)
                        print("\n" + "="*60)
                        found = True
                        break
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n[!] Stopping miners...")
        stop_event.set()
        pool.terminate()
        pool.join()

if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()