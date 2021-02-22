import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { Post } from "./post.model";

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  constructor(
    private http: HttpClient,
    private router: Router) { }


  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;

    this.http
      .get<{ id: string, message: string, posts: any, maxPosts: number }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(map((postData) => {
        // Wrapped as an Observable
        return {
          posts: postData.posts.map(post => {
            // Transform mongodb 'ObjectId' field (_id) according to the 'Post' model (id).
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }), maxPosts: postData.maxPosts
        };
      }))
      .subscribe((transformedPostsData) => {
        console.log(transformedPostsData);

        this.posts = transformedPostsData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostsData.maxPosts
        });
      });
  }

  getPostUpdateListener(): Observable<{ posts: Post[], postCount: number }> {
    return this.postsUpdated.asObservable();
  }

  getPost(postId: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string}>(
      'http://localhost:3000/api/posts/' + postId
    );
  }

  addPost(aTitle: string, aContent: string, aImage: File): void {
    // 'FormData' allows the combination of text-values and BLOB
    const postData = new FormData();
    postData.append('title', aTitle);
    postData.append('content', aContent);
    postData.append('image', aImage, aTitle);


    this.http
      .post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
      .subscribe((responseData) => {
        this.navigateToRoot();
      });

  }

  updatePost(aId: string, aTitle: string, aContent: string, aImage: File | string, creator: string): void {
    let postData: Post | FormData;

    if (typeof (aImage) === 'object') {
      postData = new FormData();
      postData.append('id', aId);
      postData.append('title', aTitle);
      postData.append('content', aContent);
      postData.append('image', aImage, aTitle);
    } else {
      postData = {
        id: aId,
        title: aTitle,
        content: aContent,
        imagePath: aImage,
        creator: null
      }
    }

    this.http
      .put('http://localhost:3000/api/posts/' + aId, postData)
      .subscribe(response => {
        this.navigateToRoot();
      });
  }

  deletePost(postId: string): Observable<Object> {
    return this.http
      .delete('http://localhost:3000/api/posts/' + postId);
  }

  private navigateToRoot(): void {
    this.router.navigate(['/']);
  }
}
