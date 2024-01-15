const errorMessages = ["Error: no title", "Error: no link"]; // Add your error messages here

function createRequestOptions(feedUrls) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urls: feedUrls }),
  };
}

async function fetchRSS(feedUrls) {
  let feedDetails = [];
  let items = [];
  try {
    const apiUrl = "https://rss.bumpyclock.com";
    const requestUrl = `${apiUrl}/parse`;
    const requestOptions = createRequestOptions(feedUrls);
    const response = await fetch(requestUrl, requestOptions);
    const fetchedFeedData = await response.json();

    if (response.status === 200) {
      for (const feed of fetchedFeedData.feeds) {
        const isErrorTitle = errorMessages.some((msg) =>
          feed.siteTitle.includes(msg)
        );
        if (isErrorTitle) {
          feed.siteTitle = feed.feedTitle;
          console.log("no site title");
        } else {
          feed.feedUrl = feed.siteTitle;
        }

        feedDetails.push({
          siteTitle: feed.siteTitle,
          feedTitle: feed.feedTitle,
          feedUrl: feed.feedUrl,
          description: feed.description,
          author: feed.podcastInfo ? feed.podcastInfo.author : "",
          lastUpdated: feed.lastUpdated,
          lastRefreshed: feed.lastRefreshed,
          favicon: feed.favicon,
        });

        if (Array.isArray(feed.items)) {
          feed.items.forEach((item) => {
            items.push({
              id: item.id,
              title: item.title,
              siteTitle: isErrorTitle ? feed.feedTitle : feed.siteTitle,
              feedTitle: feed.feedTitle,
              thumbnail: item.thumbnail,
              link: item.link,
              feedUrl: feed.feedUrl,
              favicon: feed.favicon,
              author: item.author,
              published: item.published,
              created: item.created,
              category: item.category,
              content: item.content,
              media: item.media,
              enclosures: item.enclosures,
              podcastInfo: {
                author: item.podcastInfo ? item.podcastInfo.author : "",
                image: item.podcastInfo ? item.podcastInfo.image : "",
                categories: item.podcastInfo
                  ? item.podcastInfo.categories
                  : [],
              },
            });
          });
        } else {
          console.log("feed.items is not an array: ", JSON.stringify(feed));
        }
      }
      items.sort((a, b) => new Date(b.published) - new Date(a.published));     


    } else {
      console.error("API response: ", JSON.stringify(fetchedFeedData));
      throw new Error("Server response wasn't ok: ", response.status);
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
 
  return { feedDetails, items };
}

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'FETCH_RSS') {
    const feedData = await fetchRSS(event.data.payload.urls);
    // Send the fetched data back to the main thread
    event.ports[0].postMessage({
      type: 'RSS_DATA',
      payload: feedData,
    });
  }
});

