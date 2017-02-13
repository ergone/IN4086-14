/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package volume;

/**
 *
 * @author michel
 * @ Anna
 * This class contains the pre-computes gradients of the volume. This means calculates the gradient
 * at all voxel positions, and provides functions
 * to get the gradient at any position in the volume also continuous..
*/
public class GradientVolume {

    public GradientVolume(Volume vol) {
        volume = vol;
        dimX = vol.getDimX();
        dimY = vol.getDimY();
        dimZ = vol.getDimZ();
        data = new VoxelGradient[dimX * dimY * dimZ];
        compute();
        maxmag = -1.0;
    }
    
    /**     
     * VoxelGradient Tri-Linear Interpolation
     * by @ergone - Piotr Tekieli
     * reuses fragments from @mulinnuha's tri-linear implementation
     * 
     * @function PerformVoxelInterpolation : linearly interpolates gradient vector g0 and g1 given the factor (t) 
     * @function getTrilinearGradient : performs tri-linear interpolation on given coordinates to obtain (voxel) gradient
     * @function ConvertTFtoRGBA : converts TFColor object to integer by bitshifting values (ARGB)
     * @function CalculateColor : calculates new TFColor based on Levoy's formula for color compositing (transparency)
     * 
     * The function names have been changed, as well as passed parameters and returned values. 
     * All of that was done to enable more efficient performance and provide clearer understanding of written code.
     * Redundant Nearest-Neightbour implementaiton was removed.
    */
    
    private VoxelGradient PerformVoxelInterpolation(VoxelGradient g0, VoxelGradient g1, float factor) {        
        float x = g0.x * factor + g1.x * (1 - factor);
        float y = g0.y * factor + g1.y * (1 - factor);
        float z = g0.z * factor + g1.z * (1 - factor);        
        return new VoxelGradient(x,y,z);        
    }
    
    public VoxelGradient getTrilinearGradient(double[] coord) {
        if (coord[0] < 0 || coord[0] > (dimX-2) || coord[1] < 0 || coord[1] > (dimY-2)
                || coord[2] < 0 || coord[2] > (dimZ-2)) {
            return zero;
        }        
                        
        // x0 indicates the lattice point below x 
        // x1 indicates the lattice point above x 
        // (also applies to y0, y1, z0, z1
        
        double x    = coord[0];
        double y    = coord[1];
        double z    = coord[2];        
        int x0      = (int) Math.floor(x);  
        int y0      = (int) Math.floor(y);  
        int z0      = (int) Math.floor(z);         
        int x1      = (int) Math.ceil(x);   
        int y1      = (int) Math.ceil(y);
        int z1      = (int) Math.ceil(z);        
        
        /* Derive non-negative distances from floored and initial positions */
        /* the differences are used in further calculations */
        float dx = (float) Math.abs(x0 - coord[0]);
        float dy = (float) Math.abs(y0 - coord[1]);
        float dz = (float) Math.abs(z0 - coord[2]);
        
        /* 8 vertices composed with x1,y1,z1 and x0,y0,z0 coordinates */
        VoxelGradient v000 = getGradient(x0, y0, z0);
        VoxelGradient v100 = getGradient(x1, y0, z0);       
        VoxelGradient v010 = getGradient(x0, y1, z0);
        VoxelGradient v001 = getGradient(x0, y0, z1);
        VoxelGradient v110 = getGradient(x1, y1, z0);      
        VoxelGradient v011 = getGradient(x0, y1, z1);
        VoxelGradient v101 = getGradient(x1, y0, z1);
        VoxelGradient v111 = getGradient(x1, y1, z1);

        /* Interpolate along x-es */
        VoxelGradient front_xupper = PerformVoxelInterpolation(v010, v110, dx);
        VoxelGradient back_xupper = PerformVoxelInterpolation(v011, v111, dx);        
        VoxelGradient front_xlower = PerformVoxelInterpolation(v000, v100, dx);
        VoxelGradient back_xlower = PerformVoxelInterpolation(v001 ,v101, dx); 
        /* Interpolate along y-s - Lower to Higher */
        VoxelGradient front_y = PerformVoxelInterpolation(front_xlower, front_xupper, dy);
        VoxelGradient back_y = PerformVoxelInterpolation(back_xlower, back_xupper, dy);       
        /* Interpolate along z - Front to Back */
        VoxelGradient result = PerformVoxelInterpolation(front_y, back_y, dz);
        
        return result;
    }
        
    public VoxelGradient getGradient(int x, int y, int z) {
        return data[x + dimX * (y + dimY * z)];
    }

    public void setGradient(int x, int y, int z, VoxelGradient value) {
        data[x + dimX * (y + dimY * z)] = value;
    }

    public void setVoxel(int i, VoxelGradient value) {
        data[i] = value;
    }

    public VoxelGradient getVoxel(int i) {
        return data[i];
    }

    public int getDimX() {
        return dimX;
    }

    public int getDimY() {
        return dimY;
    }

    public int getDimZ() {
        return dimZ;
    }

    private void compute() {        
        for (int i=0; i<data.length; i++) {            
            /* calculate counters' vales (y & z are dependent on the first one - x) */            
            int x = (i % dimX);
            int y = (i / dimX) % dimY;
            int z = (i / dimX) / dimY;
            
            /* Levoy - Gradient vector calculation formula derived from shading section */
            VoxelGradient TempGradient = new VoxelGradient (
                ((x - 1) >= 0) && ((x + 1) <= dimX) ? ((volume.getVoxel(x + 1, y, z) - volume.getVoxel(x - 1, y, z)) / 2) : 0,
                ((y - 1) >= 0) && ((y + 1) <= dimY) ? ((volume.getVoxel(x, y + 1, z) - volume.getVoxel(x, y - 1, z)) / 2) : 0,
                ((z - 1) >= 0) && ((z + 1) <= dimZ) ? ((volume.getVoxel(x, y, z + 1) - volume.getVoxel(x, y, z - 1)) / 2) : 0
            );            
            data[i] = TempGradient;
        }     
    }
    
    /* Modified to void since we're using global var for max magnitude*/
    public void getMaxGradientMagnitude() {        
        maxmag = data[0].mag;
        for (VoxelGradient dataval : data) {
            maxmag = dataval.mag > maxmag ? dataval.mag : maxmag;
        }       
    }
    
    private final int dimX, dimY, dimZ;    
    private final VoxelGradient zero = new VoxelGradient();
    public VoxelGradient[] data;
    public Volume volume;
    public double maxmag;
}
