import { BrandBadge, BrandLockup, type BrandTone } from '../brand/Brand';

export { BrandLockup };

/** Header lockup: lips mark ~30px tall + wordmark. */
export function HeaderBrand() {
  return <BrandLockup size={30} />;
}

/** The complete circular logo (footer, story). */
export function FullLogo({ tone = 'ink', width = 240 }: { tone?: BrandTone; width?: number }) {
  return <BrandBadge tone={tone} width={width} />;
}
