import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:async';

class WebViewPage extends StatefulWidget {
  const WebViewPage({super.key});

  @override
  WebViewPageState createState() => WebViewPageState();
}

class WebViewPageState extends State<WebViewPage> {
  InAppWebViewController? _controller;
  late final PullToRefreshController _pullToRefreshController;
  bool _hasInternet = true;
  bool _isLoading = true;
  double _progress = 0;
  late StreamSubscription<List<ConnectivityResult>> _connectivitySubscription;
  final String _mainUrl = 'https://cow-collector-22f05856.base44.app';
  String _currentUrl = '';
  CacheMode _initialCacheMode = CacheMode.LOAD_DEFAULT;

  @override
  void initState() {
    super.initState();
    _currentUrl = _mainUrl;
    _initializeWebView();
    _initConnectivity();
  }

  void _initializeWebView() {
    _pullToRefreshController = PullToRefreshController(
      settings: PullToRefreshSettings(
        color: Colors.pink,
        backgroundColor: Colors.black,
      ),
      onRefresh: () async {
        if (_hasInternet) {
          // Just reload - don't clear cache to preserve user data and session
          await _controller?.reload();
        } else {
          _pullToRefreshController.endRefreshing();
          // Show a snackbar indicating offline mode
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Viewing cached version - No internet connection'),
                duration: Duration(seconds: 2),
              ),
            );
          }
        }
      },
    );
  }

  Future<void> _initConnectivity() async {
    final connectivity = Connectivity();
    final initialStatus = await connectivity.checkConnectivity();
    final hasInternet = initialStatus.isNotEmpty &&
        !initialStatus.contains(ConnectivityResult.none);
    
    setState(() {
      _hasInternet = hasInternet;
      // Set initial cache mode based on connectivity
      _initialCacheMode = hasInternet 
          ? CacheMode.LOAD_DEFAULT 
          : CacheMode.LOAD_CACHE_ELSE_NETWORK;
      _isLoading = false;
    });

    _connectivitySubscription =
        connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      final hasInternet =
          results.isNotEmpty && !results.contains(ConnectivityResult.none);
      if (_hasInternet != hasInternet) {
        setState(() {
          _hasInternet = hasInternet;
        });
        if (hasInternet) {
          // When connection is restored, switch back to normal browser mode and reload
          setState(() {
            _initialCacheMode = CacheMode.LOAD_DEFAULT;
          });
          _controller?.setSettings(
            settings: InAppWebViewSettings(
              cacheMode: CacheMode.LOAD_DEFAULT,
            ),
          ).then((_) {
            _controller?.reload();
          });
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('✅ Back online - Loading fresh content'),
                duration: Duration(seconds: 2),
                backgroundColor: Colors.green,
              ),
            );
          }
        } else {
          // Show offline indicator
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('📵 Offline - Showing cached content'),
                duration: Duration(seconds: 3),
                backgroundColor: Colors.orange,
              ),
            );
          }
        }
      }
    });
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    super.dispose();
  }

  // Helper method to clear cache and reload (can be called manually if needed)
  // Note: This clears HTTP cache but preserves user data (cookies, localStorage, etc.)
  Future<void> _clearCacheAndReload() async {
    // Clear HTTP cache only, not user data
    await _controller?.clearCache();
    await _controller?.reload();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cache cleared - Loading fresh content'),
          duration: Duration(seconds: 2),
          backgroundColor: Colors.blue,
        ),
      );
    }
  }

  // Check if we're on the main/home page (Game page)
  bool _isOnMainPage() {
    if (_currentUrl.isEmpty) return true;
    
    final uri = Uri.parse(_currentUrl);
    final path = uri.path;
    
    debugPrint('Checking if on main page...');
    debugPrint('Current URL: $_currentUrl');
    debugPrint('Parsed path: $path');
    
    // Only consider home/game page as "main page" where back should exit app
    // Any other route should navigate back to home instead
    final isMain = path == '/' || 
           path == '' || 
           path == '/Game' ||
           _currentUrl == _mainUrl;
    
    debugPrint('Is main page: $isMain');
    return isMain;
  }

  // Legacy method kept for reference
  // ignore: unused_element
  Future<bool> _onWillPop() async {
    if (_controller != null && await _controller!.canGoBack()) {
      _controller!.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, Object? result) async {
        if (didPop) return;
        
        // Get the current URL from the WebView
        final currentWebUrl = await _controller?.getUrl();
        if (currentWebUrl != null) {
          setState(() {
            _currentUrl = currentWebUrl.toString();
          });
          debugPrint('Back button pressed - Current URL: $_currentUrl');
          debugPrint('Is on main page: ${_isOnMainPage()}');
        }
        
        // Check if we're on the main page
        if (_isOnMainPage()) {
          // Show exit confirmation dialog
          final shouldExit = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Exit App?'),
              content: const Text('Do you want to exit the app?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Exit'),
                ),
              ],
            ),
          );
          
          if (shouldExit == true && mounted) {
            SystemNavigator.pop();
          }
        } else {
          // Not on main page, try to go back in WebView
          final canGoBack = await _controller?.canGoBack() ?? false;
          if (canGoBack) {
            _controller?.goBack();
          } else {
            // Fallback: load main URL (go back to home/game page)
            _controller?.loadUrl(
              urlRequest: URLRequest(url: WebUri(_mainUrl)),
            );
          }
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              // Loading Progress Indicator
              if (_progress < 1.0)
                LinearProgressIndicator(
                  value: _progress,
                  backgroundColor: Colors.grey[200],
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.purple),
                  minHeight: 3,
                ),
              // WebView Content
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: Colors.purple,
                        ),
                      )
                    : InAppWebView(
                  initialUrlRequest: URLRequest(
                    url: WebUri(_mainUrl),
                  ),
                  initialSettings: InAppWebViewSettings(
                    useShouldOverrideUrlLoading: true,
                    mediaPlaybackRequiresUserGesture: false,
                    javaScriptCanOpenWindowsAutomatically: true,
                    javaScriptEnabled: true,
                    transparentBackground: true,
                    cacheEnabled: true,
                    clearCache: false,
                    useOnDownloadStart: true,
                    // CRITICAL: Ensure credentials (cookies, auth headers) are sent with API requests
                    incognito: false,
                    userAgent:
                        'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
                    // Android specific
                    useHybridComposition: true,
                    domStorageEnabled: true,
                    databaseEnabled: true,
                    mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
                    // Dynamic cache mode: LOAD_DEFAULT when online, LOAD_CACHE_ELSE_NETWORK when offline
                    cacheMode: _initialCacheMode,
                    // Allow content access for cached resources
                    allowContentAccess: true,
                    allowFileAccess: true,
                    // CRITICAL: Enable third-party cookies for authentication/session persistence
                    thirdPartyCookiesEnabled: true,
                    // Enable cookies for cross-origin requests (Supabase API calls)
                    sharedCookiesEnabled: true,
                    // Enable secure access modes for IndexedDB and Web SQL
                    allowFileAccessFromFileURLs: true,
                    allowUniversalAccessFromFileURLs: true,
                    // iOS specific
                    allowsInlineMediaPlayback: true,
                    allowsBackForwardNavigationGestures: true,
                    limitsNavigationsToAppBoundDomains: false,
                  ),
                  pullToRefreshController: _pullToRefreshController,
                  onWebViewCreated: (controller) {
                    _controller = controller;
                    
                    // Add JavaScript handlers for offline detection
                    controller.addJavaScriptHandler(
                      handlerName: 'checkConnection',
                      callback: (args) async {
                        final connectivity = Connectivity();
                        final result = await connectivity.checkConnectivity();
                        final hasInternet = result.isNotEmpty && 
                            !result.contains(ConnectivityResult.none);
                        
                        if (hasInternet) {
                          controller.loadUrl(
                            urlRequest: URLRequest(url: WebUri(_mainUrl)),
                          );
                        }
                        return hasInternet;
                      },
                    );

                    controller.addJavaScriptHandler(
                      handlerName: 'onlineStatusChanged',
                      callback: (args) {
                        if (args.isNotEmpty && args[0] == true) {
                          controller.loadUrl(
                            urlRequest: URLRequest(url: WebUri(_mainUrl)),
                          );
                        }
                      },
                    );
                  },
                  shouldOverrideUrlLoading: (controller, navigationAction) async {
                    return NavigationActionPolicy.ALLOW;
                  },
                  onLoadStart: (controller, url) {
                    setState(() {
                      _currentUrl = url?.toString() ?? _mainUrl;
                    });
                    debugPrint('Page started loading: $url');
                    debugPrint('Current URL set to: $_currentUrl');
                  },
                  onLoadStop: (controller, url) async {
                    _pullToRefreshController.endRefreshing();
                    setState(() {
                      _currentUrl = url?.toString() ?? _mainUrl;
                    });
                    debugPrint('Page finished loading: $url');
                    debugPrint('Current URL set to: $_currentUrl');
                  },
                  onReceivedError: (controller, request, error) {
                    _pullToRefreshController.endRefreshing();
                    debugPrint('Received error: ${error.description}');
                    
                    // If error is due to no internet and we're not already in offline mode
                    if ((!_hasInternet || error.type == WebResourceErrorType.HOST_LOOKUP) 
                        && _initialCacheMode != CacheMode.LOAD_CACHE_ELSE_NETWORK) {
                      debugPrint('Switching to offline mode and reloading from cache');
                      // Change cache mode to use cache
                      setState(() {
                        _initialCacheMode = CacheMode.LOAD_CACHE_ELSE_NETWORK;
                      });
                      controller.setSettings(
                        settings: InAppWebViewSettings(
                          cacheMode: CacheMode.LOAD_CACHE_ELSE_NETWORK,
                        ),
                      ).then((_) {
                        controller.reload();
                      });
                    }
                  },
                  onReceivedHttpError: (controller, request, response) {
                    debugPrint('HTTP error: ${response.statusCode}');
                  },
                  onProgressChanged: (controller, progress) {
                    setState(() {
                      _progress = progress / 100;
                    });
                    if (progress == 100) {
                      _pullToRefreshController.endRefreshing();
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}