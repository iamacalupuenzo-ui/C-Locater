import type { CameraPosition } from '../../lib/cameraData';

export interface CameraScene {
  background: string;
  // Optional tint overlay class for scanline color
  tint: string;
}

// Each position has a distinct CSS gradient simulating a real camera view
export const CAMERA_SCENES: Record<CameraPosition, CameraScene> = {
  frontal: {
    // Sky + horizon + asphalt road perspective
    background: `
      linear-gradient(
        to bottom,
        #3A7BC8 0%, #5599D4 18%, #7ABCE8 28%,
        #A8C890 35%, #7A9858 40%,
        #686868 48%, #585858 58%, #484848 70%, #282828 100%
      )
    `,
    tint: 'rgba(80,120,180,0.06)',
  },
  trasera: {
    // Rear perspective: road receding, lighter sky
    background: `
      linear-gradient(
        to bottom,
        #6888A8 0%, #8AA8C0 20%, #A8C0D0 32%,
        #C0C8A8 38%, #A0A870 42%,
        #707070 50%, #606060 65%, #484848 80%, #2A2A2A 100%
      )
    `,
    tint: 'rgba(100,130,160,0.06)',
  },
  'lateral-der': {
    // Right side: ground rush + treeline + sky
    background: `
      linear-gradient(
        to bottom,
        #3A6AB0 0%, #5888C4 22%,
        #88A868 38%, #6A9050 45%,
        #888838 52%, #706828 60%, #585020 70%, #383018 100%
      )
    `,
    tint: 'rgba(60,100,60,0.08)',
  },
  'lateral-izq': {
    // Left side: mirror of right, slightly different exposure
    background: `
      linear-gradient(
        to bottom,
        #2A5898 0%, #4878B0 22%,
        #708858 38%, #587840 45%,
        #787030 52%, #606020 60%, #484810 70%, #282800 100%
      )
    `,
    tint: 'rgba(60,100,40,0.08)',
  },
  cabina: {
    // Interior warm: dashboard glow + window light
    background: `
      linear-gradient(
        135deg,
        #1A1208 0%, #3A2808 15%,
        #7A5010 30%, #B87820 45%,
        #E09820 55%, #C07818 65%,
        #7A4808 78%, #3A2008 90%, #1A0C00 100%
      )
    `,
    tint: 'rgba(200,140,0,0.08)',
  },
  exterior: {
    // Parking / urban: overcast sky + pavement
    background: `
      linear-gradient(
        to bottom,
        #A8B0B8 0%, #909098 25%,
        #787880 42%, #686870 52%,
        #585860 65%, #484850 80%, #282830 100%
      )
    `,
    tint: 'rgba(100,100,110,0.06)',
  },
};

export function getCameraScene(position: CameraPosition): CameraScene {
  return CAMERA_SCENES[position] ?? CAMERA_SCENES['exterior'];
}
