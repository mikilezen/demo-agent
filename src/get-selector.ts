import { keccak256, stringToBytes, bytesToHex } from "viem";

function printSelectors() {
  // Let's compute actual keccak256 using viem's robust utilities!
  // signature: 'usdc()'
  const usdcBytes = stringToBytes("usdc()");
  const usdcSelector = keccak256(usdcBytes).slice(0, 10);
  console.log(`usdc() Selector: ${usdcSelector}`);

  // signature: 'treasury()'
  const treasuryBytes = stringToBytes("treasury()");
  const treasurySelector = keccak256(treasuryBytes).slice(0, 10);
  console.log(`treasury() Selector: ${treasurySelector}`);
}

printSelectors();
