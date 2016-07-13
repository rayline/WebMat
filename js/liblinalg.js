var linalg = {};

linalg.newMat = function (x,y){
    /*
    Creates a new matrix (basically a two dimension Array)
    x,y {number}
    * */
    var mat = new Array(x);
    for(var i=0;i<y;i++){
        mat[i] = new Array(y);
    }
    for(i=0;i<x;i++){
        for(var j=0;j<x;j++){
            mat[i][j] = 0;
        }
    }
    return mat;
};

linalg.add = function (A,B){
    /*
    calculates A+B
    A,B {matrix}
     */
    if(A.length!= B.length|| A[0].length!= B[0].length){
        throw "Adding matrix with not same structure!";
    }
    var C = linalg.newMat(A.length, A[0].length);
    for(var i=0;i< A.length;i++){
        for(var j=0;j< A[0].length;j++){
            C[i][j] = A[i][j]+B[i][j];
        }
    }
    return C;
};

linalg.minus = function(A){
    /*
    returns -A
    A {matrix]
     */
    var B = linalg.newMat(A.length, A[0].length);
    for(var i=0;i< A.length;i++){
        for(var j=0;j< A[0].length;j++){
            B[i][j] = -A[i][j];
        }
    }
    return B;
};

linalg.copyMat = function(A){
    /*
    returns a copy of A
    A {matrix}
     */
    var B = linalg.newMat(A.length, A[0].length);
    for(var i=0;i< A.length;i++){
        for(var j=0;j< A[0].length;j++){
            B[i][j] = A[i][j];
        }
    }
    return B;
};

linalg.transpose = function(A){
    /*
    returns the transpose of A
    A {matrix}
     */
    var B = linalg.newMat(A[0].length, A.length);
    for(var i=0;i< A.length;i++){
        for(var j=0;j< A[0].length;j++){
            B[j][i] = A[i][j];
        }
    }
    return B;
};

linalg.scalarMulti = function(A, c){
    /*
    returns cA (c is a number and A is matrix)
    A {matrix} c {Number|String(numeric)}
     */
    var B = linalg.newMat(A[0].length, A.length);
    for(var i=0;i< A.length;i++){
        for(var j=0;j< A[0].length;j++){
            B[i][j] = c*A[i][j];
        }
    }
    return B;
};

linalg.multi = function(A,B){
    /*
    returns AB, with complexity O(n^3)
    requires AB to be multipliable, otherwise it throws an exception
    A,B {matrix}
     */
    if(A[0].length!= B.length){
        throw "Impossible to multiply Matrix with structure like this";
    }
    var Bt = linalg.transpose(B);
    var C = linalg.newMat(A.length, B[0].length);
    var xx = A.length, yy = Bt.length;
    for(var i=0;i< xx;i++){
        for(var j=0;j<yy;j++){
            var d = 0;
            for(var k = 0;k< A[0].length;k++){
                d= d+A[i][k]*Bt[j][k];
            }
            C[i][j] = d;
        }
    }
    return C;
};

linalg.determinant = function(A){
    /*
    returns determinant of A(square matrix)
    complexity not proven since it depends greatly on how large the numbers are, and usually they become incredibly large when it's a large matrix
    requires A to be a square matrix, otherwise it throws an exception
    A {matrix}
     */
    if(A.length!= A[0].length){
        throw "Impossible to calculate determinant of non-square matrix!";
    }
    var B = linalg.copyMat(A);
    var sign = 1;
    var x = B.length;
    var res = 1;
    for(i=0;i<x;i++){
        if(B[i][i]==0){
            var done = false;
            for(j=i+1;j<x;j++){
                if(!B[j][i]==0){
                    var tmp = B[i];
                    B[i] = B[j];
                    B[j] = tmp;
                    sign = -sign;
                    done = true;
                    break;
                }
            }
            if(!done){
                return 0;
            }
        }
        for(j=i+1;j<x;j++){
            var ratio = B[j][i]/B[i][i];
            for(var k=i;k<x;k++){
                B[j][k]=B[j][k]-B[i][k]*ratio;
            }
        }
        res=res*B[i][i];
    }
    return res*sign;
};

linalg.inverse = function(A){
    /*
    returns the inverse matrix of A(square matrix)
    similiar with determinant, comes to be slow when numbers become huge
    A {matrix}
     */
    if(A.length!= A[0].length){
        throw "Impossible to calculate inverse of non-square matrix!";
    }
    var B = linalg.copyMat(A);
    var C = linalg.newMat(A.length,A[0].length);
    var x = A.length;
    for(i=0;i<x;i++){
        C[i][i]=1;
    }

    for(i=0;i<x;i++){
        if(B[i][i]==0){
            var done = false;
            for(j=i+1;j<x;j++){
                if(!B[j][i]==0){
                    var tmp = B[i];
                    B[i] = B[j];
                    B[j] = tmp;
                    tmp = C[i];
                    C[i] = C[j];
                    C[j] = tmp;
                    done = true;
                    break;
                }
            }
            if(!done){
                throw "Impossible to calculate inverse of non-full-rank matrix!";
            }
        }
        var t = B[i][i];
        for(var k=0;k<x;k++){
            B[i][k]=B[i][k]/t;
            C[i][k]=C[i][k]/t;
        }
        for(j=i+1;j<x;j++){
            var ratio = B[j][i]/B[i][i];
            if(ratio==0) continue;
            if(!isFinite(ratio)) throw "Impossible to calculate inverse of non-full-rank matrix!";
            for(k=0;k<x;k++){
                B[j][k]=B[j][k]-ratio*B[i][k];
                C[j][k]=C[j][k]-ratio*C[i][k];
            }
        }
    }
    for(i=x-1;i>=0;i--){
        for(j=i-1;j>=0;j--){
            ratio = B[j][i]/B[i][i];
            if(ratio==0) continue;
            for(k = 0;k<x;k++){
                B[j][k]=B[j][k]-ratio*B[i][k];
                C[j][k]=C[j][k]-ratio*C[i][k];
            }
        }
    }
    return C;
};

linalg.trace = function(A){
    /*
    returns trace of A (square matrix)
    requires the matrix to be suqare, otherwise throws an exception
    A {matrix}
     */
    if(A.length!=A[0].length){
        throw "Impossible to calculate trace of non-square matrix!";
    }
    var t =0;
    for(var i=0;i< A.length;i++){
        t= t+A[i][i];
    }
    return t;
};