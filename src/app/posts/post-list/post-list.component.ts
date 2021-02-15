import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   {title: "First Post", content: "This is the first post's content"},
  //   {title: "Second Post", content: This is the second post's content"},
  //   {title: "Third Post", content: "This is the third post's content"},
  //   {title: "Fourth Post", content: "This is the fourth post's content"}
  // ]

  posts: Post[] = [];
  private postSubscription: Subscription;

  constructor(public postService: PostService) {
  }

  ngOnDestroy(): void {
    this.postSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.postService.getPosts();

    this.postSubscription = this.postService.getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      });
  }

}
