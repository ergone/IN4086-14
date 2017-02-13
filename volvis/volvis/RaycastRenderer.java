/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package volvis;

import com.jogamp.opengl.GL;
import com.jogamp.opengl.GL2;
import com.jogamp.opengl.util.texture.Texture;
import com.jogamp.opengl.util.texture.awt.AWTTextureIO;
import gui.RaycastRendererPanel;
import gui.TransferFunction2DEditor;
import gui.TransferFunctionEditor;
import java.awt.image.BufferedImage;
import util.TFChangeListener;
import util.VectorMath;
import volume.GradientVolume;
import volume.Volume;
import volume.VoxelGradient;

/**
 *
 * @author michel
 * @Anna
 * This class has the main code that generates the raycasting result image. 
 * The connection with the interface is already given.  
 * The different modes mipMode, slicerMode, etc. are already correctly updated
 */
public class RaycastRenderer extends Renderer implements TFChangeListener {

    private Volume volume = null;
    private GradientVolume gradients = null;
    RaycastRendererPanel panel;
    TransferFunction tFunc;
    TransferFunctionEditor tfEditor;
    TransferFunction2DEditor tfEditor2D;
    private boolean mipMode = false;
    private boolean slicerMode = true;
    private boolean compositingMode = false;
    private boolean tf2dMode = false;
    private boolean shadingMode = false;
    private short volMax = 0;
    private short volMin = 0;
    private int imageSize = 0;
    private int imageCenter = 0;
    
    public RaycastRenderer() {
        panel = new RaycastRendererPanel(this);
        panel.setSpeedLabel("0");
    }

    public void setVolume(Volume vol) {
        System.out.println("Assigning volume");
        volume = vol;

        System.out.println("Computing gradients");
        gradients = new GradientVolume(vol);
                
        // set up image for storing the resulting rendering
        // the image width and height are equal to the length of the volume diagonal
        imageSize = (int) Math.floor(Math.sqrt(vol.getDimX() * vol.getDimX() + vol.getDimY() * vol.getDimY()
                + vol.getDimZ() * vol.getDimZ()));
        if (imageSize % 2 != 0) {
            imageSize = imageSize + 1;
        }
        imageCenter = imageSize / 2;
        image = new BufferedImage(imageSize, imageSize, BufferedImage.TYPE_INT_ARGB);
        tFunc = new TransferFunction(volume.getMinimum(), volume.getMaximum());
        tFunc.setTestFunc();
        tFunc.addTFChangeListener(this);
        tfEditor = new TransferFunctionEditor(tFunc, volume.getHistogram());
        
        tfEditor2D = new TransferFunction2DEditor(volume, gradients);
        tfEditor2D.addTFChangeListener(this);
        
        volMin = volume.getMinimum();
        volMax = volume.getMaximum();
        
        System.out.println("Finished initialization of RaycastRenderer");
    }

    public RaycastRendererPanel getPanel() {
        return panel;
    }

    public TransferFunction2DEditor getTF2DPanel() {
        return tfEditor2D;
    }
    
    public TransferFunctionEditor getTFPanel() {
        return tfEditor;
    }
     
    public void setShadingMode(boolean mode) {
        shadingMode = mode;
        changed();
    }
    
    public void setMIPMode() {
        setMode(false, true, false, false);
    }
    
    public void setSlicerMode() {
        setMode(true, false, false, false);
    }
    
    public void setCompositingMode() {
        setMode(false, false, true, false);
    }
    
    public void setTF2DMode() {
        setMode(false, false, false, true);
    }
    
    private void setMode(boolean slicer, boolean mip, boolean composite, boolean tf2d) {
        slicerMode = slicer;
        mipMode = mip;
        compositingMode = composite;
        tf2dMode = tf2d;        
        changed();
    }
    
    /**
     * Calculation, Convertion Functions & Optimization (@ergone) - Piotr Tekieli
     * @function ClearImage : clears image's pixels (moved from raycaster / slicer)
     * @function DefinePlance : defines plane perpendicular to the viewing vector
     * @function ConvertTFtoRGBA : converts TFColor object to integer by bitshifting values (ARGB)
     * @function CalculateColor : calculates new TFColor based on Levoy's formula for color compositing (transparency)
     * optionally customized tr, tb, tg and alpha values (used with gradient-based / shading 2D-TF implementation)
     * @note :: color formulas are based on the equation from Levoy's paper (compositing eq in rendering pipeline)
     */
    private void ClearImage() {
        for (int j = 0; j < imageSize; j++) {
            for (int i = 0; i < imageSize; i++) {
                image.setRGB(i, j, 0);
            }
        }
    }
    
    private void DefinePlane(double[] viewVec, double[] uVec, double[] vVec) {
        // vector uVec and vVec define a plane through the origin, 
        // perpendicular to the view vector viewVec
        VectorMath.setVector(viewVec, viewMatrix[2], viewMatrix[6], viewMatrix[10]);
        VectorMath.setVector(uVec, viewMatrix[0], viewMatrix[4], viewMatrix[8]);
        VectorMath.setVector(vVec, viewMatrix[1], viewMatrix[5], viewMatrix[9]);        
    }
    
    private int ConvertTFtoRGBA(TFColor voxelColor) {        
        int c_alpha = voxelColor.a <= 1.0 ? (int) Math.floor(voxelColor.a * 255) : 255;
        int c_red = voxelColor.r <= 1.0 ? (int) Math.floor(voxelColor.r * 255) : 255;
        int c_green = voxelColor.g <= 1.0 ? (int) Math.floor(voxelColor.g * 255) : 255;
        int c_blue = voxelColor.b <= 1.0 ? (int) Math.floor(voxelColor.b * 255) : 255;
        int pixelColor = (c_alpha << 24) | (c_red << 16) | (c_green << 8) | c_blue;
        return pixelColor;
    }
    
    private TFColor CalculateColor(TFColor toUpdate, TFColor current) {
        TFColor toReturn = new TFColor();
        toReturn.a = current.a * (1 - toUpdate.a) + toUpdate.a;
        toReturn.r = current.r * (1 - toUpdate.a) + toUpdate.a * toUpdate.r;
        toReturn.g = current.g * (1 - toUpdate.a) + toUpdate.a * toUpdate.g;
        toReturn.b = current.b * (1 - toUpdate.a) + toUpdate.a * toUpdate.b;
        return toReturn;
    }
    
    private TFColor CalculateColor(TFColor toUpdate, TFColor current, double alpha) {
        TFColor toReturn = new TFColor();
        toReturn.a = current.a * (1 - alpha) + alpha;
        toReturn.r = current.r * (1 - alpha) + alpha * toUpdate.r;
        toReturn.g = current.g * (1 - alpha) + alpha * toUpdate.g;
        toReturn.b = current.b * (1 - alpha) + alpha * toUpdate.b;
        return toReturn;
    } 
    
    private TFColor CalculateColor(TFColor current, double alpha, double tr, double tg, double tb) {
        TFColor toReturn = new TFColor();
        toReturn.r = current.r * (1 - alpha) + alpha * tr;                
        toReturn.g = current.g * (1 - alpha) + alpha * tg;                
        toReturn.b = current.b * (1 - alpha) + alpha * tb;                
        toReturn.a = current.a * (1 - alpha) + alpha;
        return toReturn;
    }
    /* ------------------------------------------------------------------------------------------- */
    
    private void drawBoundingBox(GL2 gl) {
        gl.glPushAttrib(GL2.GL_CURRENT_BIT);
        gl.glDisable(GL2.GL_LIGHTING);
        gl.glColor4d(1.0, 1.0, 1.0, 1.0);
        gl.glLineWidth(1.5f);
        gl.glEnable(GL.GL_LINE_SMOOTH);
        gl.glHint(GL.GL_LINE_SMOOTH_HINT, GL.GL_NICEST);
        gl.glEnable(GL.GL_BLEND);
        gl.glBlendFunc(GL.GL_SRC_ALPHA, GL.GL_ONE_MINUS_SRC_ALPHA);

        gl.glBegin(GL.GL_LINE_LOOP);
        gl.glVertex3d(-volume.getDimX() / 2.0, -volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(-volume.getDimX() / 2.0, volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, -volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glEnd();

        gl.glBegin(GL.GL_LINE_LOOP);
        gl.glVertex3d(-volume.getDimX() / 2.0, -volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glVertex3d(-volume.getDimX() / 2.0, volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, -volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glEnd();

        gl.glBegin(GL.GL_LINE_LOOP);
        gl.glVertex3d(volume.getDimX() / 2.0, -volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, -volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glEnd();

        gl.glBegin(GL.GL_LINE_LOOP);
        gl.glVertex3d(-volume.getDimX() / 2.0, -volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glVertex3d(-volume.getDimX() / 2.0, -volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(-volume.getDimX() / 2.0, volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(-volume.getDimX() / 2.0, volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glEnd();

        gl.glBegin(GL.GL_LINE_LOOP);
        gl.glVertex3d(-volume.getDimX() / 2.0, volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glVertex3d(-volume.getDimX() / 2.0, volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glEnd();

        gl.glBegin(GL.GL_LINE_LOOP);
        gl.glVertex3d(-volume.getDimX() / 2.0, -volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glVertex3d(-volume.getDimX() / 2.0, -volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, -volume.getDimY() / 2.0, volume.getDimZ() / 2.0);
        gl.glVertex3d(volume.getDimX() / 2.0, -volume.getDimY() / 2.0, -volume.getDimZ() / 2.0);
        gl.glEnd();

        gl.glDisable(GL.GL_LINE_SMOOTH);
        gl.glDisable(GL.GL_BLEND);
        gl.glEnable(GL2.GL_LIGHTING);
        gl.glPopAttrib();

    }
    
    private boolean intersectLinePlane(double[] plane_pos, double[] plane_normal,
            double[] line_pos, double[] line_dir, double[] intersection) {

        double[] tmp = new double[3];

        for (int i = 0; i < 3; i++) {
            tmp[i] = plane_pos[i] - line_pos[i];
        }

        double denom = VectorMath.dotproduct(line_dir, plane_normal);
        if (Math.abs(denom) < 1.0e-8) {
            return false;
        }

        double t = VectorMath.dotproduct(tmp, plane_normal) / denom;

        for (int i = 0; i < 3; i++) {
            intersection[i] = line_pos[i] + t * line_dir[i];
        }

        return true;
    }

    private boolean validIntersection(double[] intersection, double xb, double xe, double yb,
            double ye, double zb, double ze) {

        return (((xb - 0.5) <= intersection[0]) && (intersection[0] <= (xe + 0.5))
                && ((yb - 0.5) <= intersection[1]) && (intersection[1] <= (ye + 0.5))
                && ((zb - 0.5) <= intersection[2]) && (intersection[2] <= (ze + 0.5)));

    }

    private void intersectFace(double[] plane_pos, double[] plane_normal,
            double[] line_pos, double[] line_dir, double[] intersection,
            double[] entryPoint, double[] exitPoint) {

        boolean intersect = intersectLinePlane(plane_pos, plane_normal, line_pos, line_dir,
                intersection);
        if (intersect) {

            double xpos0 = 0;
            double xpos1 = volume.getDimX();
            double ypos0 = 0;
            double ypos1 = volume.getDimY();
            double zpos0 = 0;
            double zpos1 = volume.getDimZ();

            if (validIntersection(intersection, xpos0, xpos1, ypos0, ypos1,
                    zpos0, zpos1)) {
                if (VectorMath.dotproduct(line_dir, plane_normal) > 0) {
                    entryPoint[0] = intersection[0];
                    entryPoint[1] = intersection[1];
                    entryPoint[2] = intersection[2];
                } else {
                    exitPoint[0] = intersection[0];
                    exitPoint[1] = intersection[1];
                    exitPoint[2] = intersection[2];
                }
            }
        }
    }
        
    /**
     * MIP Implementation (@mulinnuha)
     * Optimization & fixes by @ergone
     * @param entryPoint : the position of entry point on raycasted voxel
     * @param exitPoint : the position of exit point on raycasted voxel
     * @param viewVec : viewing ray vector
     * @param sampleStep : stepping size for dividing ray between entry/exit points
     * @note :: the one is used for determining how many calculations (interpolations) are done on the ray segment between e/e points
     * that is for how many (and which) points we're going to do tri-linear interpolations.
     * @return : color value in RGBA format (int)
     */
    int traceRayMIP(double[] entryPoint, double[] exitPoint, double[] viewVec, float sampleStep) {
        int color, alpha; /* color value, alpha for opacity */              
        double max = 0; /* temporary maximal value */
        double rayLength = VectorMath.distance(entryPoint, exitPoint); /* calculate vector length between e/e points */            
        int stepping = (int) (rayLength / sampleStep); /* determine stepping for intermediate points */
        
        for (int i=0; i<stepping; i++){
            double[] pixelCoord = new double[3];
            pixelCoord[0] = (entryPoint[0] - (sampleStep * viewVec[0] * i)); /* get position x of intermediate point */
            pixelCoord[1] = (entryPoint[1] - (sampleStep * viewVec[1] * i)); /* get position y of intermediate point */
            pixelCoord[2] = (entryPoint[2] - (sampleStep * viewVec[2] * i)); /* get position z of intermediate point */            
            max = (short) Math.max(max, volume.getVoxelInterpolate(pixelCoord)); /* interpolate and compare (replace) with temporary max value */
        }        
        
        /* Illumination fix by @ergone*/
        alpha = (int) (255 * max / volMax);        
        color = (255 << 24) | (alpha << 16) | (alpha << 8) | alpha; 
        // color = (alpha << 24) | (255 << 16) | (255 << 8) | 255; this one is quite dark, it is better to set max opacity and push alpha to RGBs
        return color;
    }
    
    /**
     * Compositing Implementation & Optimization (@ergone)
     * @param entryPoint  : the position of entry point on raycasted voxel
     * @param exitPoint : the position of exit point on raycasted voxel
     * @param viewVec : viewing ray vector
     * @param sampleStep : stepping size for dividing ray between entry/exit points
     * @return : color value in RGBA format (int)
     */
    int traceRayCompositing(double[] entryPoint, double[] exitPoint, double[] viewVec, float sampleStep){
        TFColor auxColor = new TFColor(0,0,0,1);        
        double rayLength = VectorMath.distance(entryPoint, exitPoint);            
        int stepping = (int) (rayLength / sampleStep);
        
        for (int i=0; i<stepping; i++){            
            double[] pixelCoord = new double[3];
            pixelCoord[0] = (entryPoint[0] - (sampleStep * viewVec[0] * i));
            pixelCoord[1] = (entryPoint[1] - (sampleStep * viewVec[1] * i));
            pixelCoord[2] = (entryPoint[2] - (sampleStep * viewVec[2] * i));  
            /* calculate new color based on the existing auxiliary value and value from transfer function derived for tri-interpolated voxel */
            auxColor = CalculateColor(tFunc.getColor(volume.getVoxelInterpolate(pixelCoord)), auxColor); 
            
        }                
        return ConvertTFtoRGBA(auxColor);
    }
    
    /**
     * Transfer Function 2D Implementation & Optimization (@ergone)
     * @param entryPoint  : the position of entry point on raycasted voxel
     * @param exitPoint : the position of exit point on raycasted voxel
     * @param viewVec : viewing ray vector
     * @param sampleStep : stepping size for dividing ray between entry/exit points
     * @return : color value in RGBA format (int)
     */
    int traceRayTF2D(double[] entryPoint, double[] exitPoint, double[] viewVec, float sampleStep){
        /* Acquire necessary values from 2D TF widget */
        /* R - Radius, Fv - Base Intensity, color - Color */
        TransferFunction2DEditor.TriangleWidget TF2DWidget = this.getTF2DPanel().triangleWidget; /* Create new TF2D widget object */
        double r = TF2DWidget.radius; /* get radius value from the widget */
        short fv = TF2DWidget.baseIntensity; /* get base intensity (fv) from the widget */
        TFColor color = TF2DWidget.color; /* get color value from the widget */
        TFColor auxColor = new TFColor(0, 0, 0, 1); /* create auxiliary TFColor object for color / opacity calculations */       
        double rayLength = VectorMath.distance(entryPoint, exitPoint);            
        int stepping = (int) (rayLength / sampleStep);
                
        for (int i=0; i<stepping; i++){            
            double[] pixelCoord = new double[3];
            pixelCoord[0] = (entryPoint[0] - (sampleStep * viewVec[0] * i));
            pixelCoord[1] = (entryPoint[1] - (sampleStep * viewVec[1] * i));
            pixelCoord[2] = (entryPoint[2] - (sampleStep * viewVec[2] * i));
            /* perform compositing based on provided values and tri-interpolated gradients */
            auxColor = TF2DCompositing(r, fv, volume.getVoxelInterpolate(pixelCoord), 
                    gradients.getTrilinearGradient(pixelCoord), viewVec, auxColor, color);             
        }
        
        return ConvertTFtoRGBA(auxColor);        
    }
 
    /**
     * Compositing for 2DTF based on Levoy's paper & Optimization (@ergone)
     * Shading by @klourens, fixed by @ergone
     * @param r : selected radius (for calculation of thickness of transition regions)
     * @param fv : selected base intensity (for calculation of thickness of transition regions)
     * @param gradient : VoxelGradient object calculated with tri-linear interpolation
     * @param viewVec : viewing ray vector
     * @param base : auxliary TFColor object with values calculate in preceeding loop iteration (acts as a base)
     * @param toUpdate : TFColor object with new values (acts as a modifier)
     * @param kAmbient : ambient reflection constant for each material
     * @param kDiff : diffuse reflection constant for each material
     * @param kSpec : specular reflection constant for each material
     * @param cAlpha : shininess for each material
     * @param light : TFColor light source
     * @return : color value in TFColor format (later will be converted to int RGBA)
     */
    
    TFColor TF2DCompositing(double r, short fv, short fxi, VoxelGradient gradient, double[] viewVec, TFColor base, TFColor toUpdate){
        /* Get the magnitude value from passed VoxelGradient */        
        short delta_fxi = (short) gradient.mag;        
        double alpha;        

        if (delta_fxi == 0 && fxi == fv) {
            alpha = toUpdate.a;
        } else if (delta_fxi > 0 && fv >= (fxi - r * delta_fxi) && fv <= (fxi + r * delta_fxi)) {
            alpha = toUpdate.a * (1 - (fv - fxi) / (r * delta_fxi));
        } else {
            alpha = 0;
        }
        
        if (shadingMode) {
            double kAmbient = 0.1;             
            double kDiff = 0.7;             
            double kSpec = 0.2;             
            double cAlpha = 10.0;            
            TFColor light = new TFColor(1,1,1,1);                                   
               
            double dotProducts = (viewVec[0] * gradient.x + viewVec[1] * gradient.y + viewVec[2] * gradient.z);            
                if (dotProducts > 0) {                
                    double LN = dotProducts / gradient.mag;                
                    double pow = Math.pow(LN, cAlpha);                
                    double tr = kAmbient * light.r + toUpdate.r * kDiff * LN + kSpec * pow;                
                    double tg = kAmbient * light.g + toUpdate.g * kDiff * LN + kSpec * pow;                
                    double tb = kAmbient * light.b + toUpdate.b * kDiff * LN + kSpec * pow; 
                    return CalculateColor(base, alpha, tr, tg, tb);
                }               
        } else {            
            return CalculateColor(toUpdate, base, alpha);        
        }
        
        return CalculateColor(toUpdate, base, alpha);
    }
    
    void computeEntryAndExit(double[] p, double[] viewVec, double[] entryPoint, double[] exitPoint) {
        for (int i = 0; i < 3; i++) {
            entryPoint[i] = -1;
            exitPoint[i] = -1;
        }

        double[] plane_pos = new double[3];
        double[] plane_normal = new double[3];
        double[] intersection = new double[3];

        VectorMath.setVector(plane_pos, volume.getDimX(), 0, 0);
        VectorMath.setVector(plane_normal, 1, 0, 0);
        intersectFace(plane_pos, plane_normal, p, viewVec, intersection, entryPoint, exitPoint);

        VectorMath.setVector(plane_pos, 0, 0, 0);
        VectorMath.setVector(plane_normal, -1, 0, 0);
        intersectFace(plane_pos, plane_normal, p, viewVec, intersection, entryPoint, exitPoint);

        VectorMath.setVector(plane_pos, 0, volume.getDimY(), 0);
        VectorMath.setVector(plane_normal, 0, 1, 0);
        intersectFace(plane_pos, plane_normal, p, viewVec, intersection, entryPoint, exitPoint);

        VectorMath.setVector(plane_pos, 0, 0, 0);
        VectorMath.setVector(plane_normal, 0, -1, 0);
        intersectFace(plane_pos, plane_normal, p, viewVec, intersection, entryPoint, exitPoint);

        VectorMath.setVector(plane_pos, 0, 0, volume.getDimZ());
        VectorMath.setVector(plane_normal, 0, 0, 1);
        intersectFace(plane_pos, plane_normal, p, viewVec, intersection, entryPoint, exitPoint);

        VectorMath.setVector(plane_pos, 0, 0, 0);
        VectorMath.setVector(plane_normal, 0, 0, -1);
        intersectFace(plane_pos, plane_normal, p, viewVec, intersection, entryPoint, exitPoint);
    }
     
    void raycast(double[] viewMatrix) {
        double[] pixelCoord = new double[3];
        double[] viewVec = new double[3];
        double[] uVec = new double[3];
        double[] vVec = new double[3];
        double[] entryPoint = new double[3];
        double[] exitPoint = new double[3];
        int increment=1;   
        float sampleStep = 0.8f;        
       
        /* Increase sampleStep while the model is being rotated to get better performance */
        if (panel.getRenderer().interactiveMode == true) {
            sampleStep = 10f;
        }
        
        ClearImage();
        DefinePlane(viewVec, uVec, vVec);            

        for (int j = 0; j < imageSize; j += increment) {
            for (int i = 0; i < imageSize; i += increment) {
                pixelCoord[0] = uVec[0] * (i - imageCenter) + vVec[0] * (j - imageCenter) - viewVec[0] * imageCenter
                        + volume.getDimX() / 2.0;
                pixelCoord[1] = uVec[1] * (i - imageCenter) + vVec[1] * (j - imageCenter) - viewVec[1] * imageCenter
                        + volume.getDimY() / 2.0;
                pixelCoord[2] = uVec[2] * (i - imageCenter) + vVec[2] * (j - imageCenter) - viewVec[2] * imageCenter
                        + volume.getDimZ() / 2.0;

                computeEntryAndExit(pixelCoord, viewVec, entryPoint, exitPoint);
                if ((entryPoint[0] > -1.0) && (exitPoint[0] > -1.0)) {
                    int pixelColor = 0;                                   
                    
                    if(mipMode) 
                        pixelColor = traceRayMIP(entryPoint, exitPoint, viewVec, sampleStep);
                    if(compositingMode)
                        pixelColor = traceRayCompositing(entryPoint, exitPoint, viewVec, sampleStep);
                    if(tf2dMode)
                        pixelColor = traceRayTF2D(entryPoint, exitPoint, viewVec, sampleStep);
                           
                    for (int ii = i; ii < i + increment; ii++) {
                        for (int jj = j; jj < j + increment; jj++) {
                            image.setRGB(ii, jj, pixelColor);
                        }
                    }
                }
            }
        }
    }

    void slicer(double[] viewMatrix) {
        double[] pixelCoord = new double[3];
        double[] viewVec = new double[3];
        double[] volumeCenter = new double[3];
        double[] uVec = new double[3];
        double[] vVec = new double[3];
        
        ClearImage();
        DefinePlane(viewVec, uVec, vVec);   
        
        TFColor voxelColor = new TFColor();
        double max = volume.getMaximum();
        
        VectorMath.setVector(volumeCenter, volume.getDimX() / 2, volume.getDimY() / 2, volume.getDimZ() / 2);
        
        for (int j = 0; j < imageSize; j++) {
            for (int i = 0; i < imageSize; i++) {
                pixelCoord[0] = uVec[0] * (i - imageCenter) + vVec[0] * (j - imageCenter)
                        + volumeCenter[0];
                pixelCoord[1] = uVec[1] * (i - imageCenter) + vVec[1] * (j - imageCenter)
                        + volumeCenter[1];
                pixelCoord[2] = uVec[2] * (i - imageCenter) + vVec[2] * (j - imageCenter)
                        + volumeCenter[2];

                int val = volume.getVoxelInterpolate(pixelCoord);               
                voxelColor.r = val/max;
                voxelColor.g = voxelColor.r;
                voxelColor.b = voxelColor.r;
                voxelColor.a = val > 0 ? 1.0 : 0.0;  
                
                image.setRGB(i, j, ConvertTFtoRGBA(voxelColor));
            }
        }
    }

    @Override
    public void visualize(GL2 gl) {        
        if (volume == null) {
            return;
        }
        
        drawBoundingBox(gl);
        gl.glGetDoublev(GL2.GL_MODELVIEW_MATRIX, viewMatrix, 0);
        
        long startTime = System.currentTimeMillis();
        if (slicerMode) {
            slicer(viewMatrix);    
        } else {
            raycast(viewMatrix);
        }
        
        long endTime = System.currentTimeMillis();
        double runningTime = (endTime - startTime);
        panel.setSpeedLabel(Double.toString(runningTime));
        
        Texture texture = AWTTextureIO.newTexture(gl.getGLProfile(), image, false);
        gl.glPushAttrib(GL2.GL_LIGHTING_BIT);
        gl.glDisable(GL2.GL_LIGHTING);
        gl.glEnable(GL.GL_BLEND);
        gl.glBlendFunc(GL.GL_SRC_ALPHA, GL.GL_ONE_MINUS_SRC_ALPHA);        
        texture.enable(gl);
        texture.bind(gl);
        double halfWidth = imageSize / 2.0;
        gl.glPushMatrix();
        gl.glLoadIdentity();
        gl.glBegin(GL2.GL_QUADS);
        gl.glColor4f(1.0f, 1.0f, 1.0f, 1.0f);
        gl.glTexCoord2d(0.0, 0.0);
        gl.glVertex3d(-halfWidth, -halfWidth, 0.0);
        gl.glTexCoord2d(0.0, 1.0);
        gl.glVertex3d(-halfWidth, halfWidth, 0.0);
        gl.glTexCoord2d(1.0, 1.0);
        gl.glVertex3d(halfWidth, halfWidth, 0.0);
        gl.glTexCoord2d(1.0, 0.0);
        gl.glVertex3d(halfWidth, -halfWidth, 0.0);
        gl.glEnd();
        texture.disable(gl);
        texture.destroy(gl);
        gl.glPopMatrix();
        gl.glPopAttrib();
        
        if (gl.glGetError() > 0) {
            System.out.println("some OpenGL error: " + gl.glGetError());
        }

    }
    
    private BufferedImage image;
    private double[] viewMatrix = new double[4 * 4];

    /* Optimized FOR loop (@ergone)*/
    @Override
    public void changed() {
        for (TFChangeListener listener : listeners) {
            listener.changed();
        }
    }
}
