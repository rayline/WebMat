#include <cstdio>
#include <cstdlib>
#include <ctime>
const int cnt = 300;
const int M = 10000;
int main(){
	srand(time(0));
	printf("[");
	for(int i=0;i<cnt;i++){
		printf("[");
		for(int j=0;j<cnt;j++){
			printf("%d,", rand()%M);
		}
		printf("%d", rand()%M);
		printf("],");
	}
		printf("[");
		for(int j=0;j<cnt;j++){
			printf("%d,", rand()%M);
		}
		printf("%d", rand()%M);
		printf("]");
	printf("]");
}