/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package volume;

import java.io.File;
import java.io.IOException;

/**
 *
 * @author michel
 * @Anna 
 * Volume object: This class contains the object and assumes that the distance between the voxels in x,y and z are 1 
 */
public class Volume {
    
    public Volume(int xd, int yd, int zd) {
        data = new short[xd*yd*zd];
        dimX = xd;
        dimY = yd;
        dimZ = zd;
    }
    
    public Volume(File file) {
        
        try {
            VolumeIO reader = new VolumeIO(file);
            dimX = reader.getXDim();
            dimY = reader.getYDim();
            dimZ = reader.getZDim();
            data = reader.getData().clone();
            computeHistogram();
        } catch (IOException ex) {
            System.out.println("IO exception");
        }
        
    }
    
    
    public short getVoxel(int x, int y, int z) {
        /* MODIFY HERE */
        // prevent array out of bounds
        
        int idx = x + dimX*(y + dimY*z);
        if (idx < 0 || idx >= data.length) {
            return 0;
        } else {
            return data[idx];
        }
    }
    
    public void setVoxel(int x, int y, int z, short value) {
        data[x + dimX*(y + dimY*z)] = value;
    }

    public void setVoxel(int i, short value) {
        data[i] = value;
    }
    
    /**
     * Trilinear Interpolation (@mulinnuha)
     * @param coord : x,y,z coordinates of the pixel
     * @return the interpolation value
     */
    public short getVoxelInterpolate(double[] coord) {
        // Trilinear Interpolation
        
        // xd, yd, and zd are the differences between each of
        // x, y, z and the smaller coordinate related
        
        // x0 indicates the lattice point below x 
        // x1 indicates the lattice point above x 
        // (also applies to y0, y1, z0, z1)
        double x    = coord[0];
        double y    = coord[1];
        double z    = coord[2];
        
        int x0      = (int) Math.floor(x);
        int y0      = (int) Math.floor(y);
        int z0      = (int) Math.floor(z);
        
        int x1      = (int) Math.ceil(x);
        int y1      = (int) Math.ceil(y);
        int z1      = (int) Math.ceil(z);
        
        if (x0 < 0 || x0 > (dimX-1) || y0 < 0 || y0 > (dimY-1) || z0 < 0 || z0 > (dimZ-1) || 
            x1 < 0 || x1 > (dimX-1) || y1 < 0 || y1 > (dimY-1) || z1 < 0 || z1 > (dimZ-1)) {
            return 0;
        }
        
        double xd   = (x-x0) / (x1-x0);
        double yd   = (y-y0) / (y1-y0);
        double zd   = (z-z0) / (z1-z0);
        
        //interpolate along x
        double c00  = getVoxel(x0,y0,z0) * (1-xd) + getVoxel(x1,y0,z0) * xd;
        double c01  = getVoxel(x0,y0,z1) * (1-xd) + getVoxel(x1,y0,z1) * xd;
        double c10  = getVoxel(x0,y1,z0) * (1-xd) + getVoxel(x1,y1,z0) * xd;
        double c11  = getVoxel(x0,y1,z1) * (1-xd) + getVoxel(x1,y1,z1) * xd;
        
        //interpolate along y
        double c0   = c00 * (1-yd) + c10 * yd;
        double c1   = c01 * (1-yd) + c11 * yd;
        
        //interpolate along z
        double c    = c0 * (1-zd) + c1 * zd;
        
        return (short) c;        
    }
    
    /**
     * Interpolation with nearest-neighbor is moved here
     * @param coord
     * @return 
     */
    public short getVoxelInterpolateNN(double[] coord){
         /* to be implemented: get the trilinear interpolated value. 
        The current implementation gets the Nearest Neightbour */
        
        if (coord[0] < 0 || coord[0] > (dimX-1) || coord[1] < 0 || coord[1] > (dimY-1)
                || coord[2] < 0 || coord[2] > (dimZ-1)) {
            return 0;
        }
        
        /* notice that in this framework we assume that the distance between neighbouring voxels is 1 in all directions*/
        
        int x = (int) Math.round(coord[0]); 
        int y = (int) Math.round(coord[1]);
        int z = (int) Math.round(coord[2]);
    
        return getVoxel(x, y, z);
        
    }
    
    public short getVoxel(int i) {
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

    public short getMinimum() {
        short minimum = data[0];
        for (int i=0; i<data.length; i++) {
            minimum = data[i] < minimum ? data[i] : minimum;
        }
        return minimum;
    }

    public short getMaximum() {
        short maximum = data[0];
        for (int i=0; i<data.length; i++) {
            maximum = data[i] > maximum ? data[i] : maximum;
        }
        return maximum;
    }
 
    public int[] getHistogram() {
        return histogram;
    }
    
    private void computeHistogram() {
        histogram = new int[getMaximum() + 1];
        for (int i=0; i<data.length; i++) {
            histogram[data[i]]++;
        }
    }
    
    private int dimX, dimY, dimZ;
    private short[] data;
    private int[] histogram;
}
